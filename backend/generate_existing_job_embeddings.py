
from psycopg2.extras import RealDictCursor

from app.database import get_db_connection
from app.services.embeddings import (
    generate_embedding,
    embedding_to_pgvector,
    MODEL_NAME
)


def generate_existing_job_embeddings():

    connection = get_db_connection()

    try:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:

            # Fetch jobs that do not have embeddings yet
            cursor.execute(
                """
                SELECT
                    j.job_id,
                    j.title,
                    j.description,
                    j.location
                FROM jobs j
                LEFT JOIN job_embeddings je
                    ON je.job_id = j.job_id
                WHERE je.job_id IS NULL;
                """
            )

            jobs = cursor.fetchall()

            print(f"Jobs requiring embeddings: {len(jobs)}")

            success_count = 0

            for job in jobs:

                job_text = f"""
                Internship Title: {job['title'] or ''}
                Description: {job['description'] or ''}
                Location: {job['location'] or ''}
                """

                try:
                    embedding = generate_embedding(job_text)
                    vector_value = embedding_to_pgvector(embedding)

                    cursor.execute(
                        """
                        INSERT INTO job_embeddings
                            (job_id, embedding, model_name, updated_at)
                        VALUES
                            (%s, %s::vector, %s, CURRENT_TIMESTAMP)
                        ON CONFLICT (job_id)
                        DO UPDATE SET
                            embedding = EXCLUDED.embedding,
                            model_name = EXCLUDED.model_name,
                            updated_at = CURRENT_TIMESTAMP;
                        """,
                        (
                            job["job_id"],
                            vector_value,
                            MODEL_NAME
                        )
                    )

                    success_count += 1
                    print(f"Embedding generated for job ID: {job['job_id']}")

                except ValueError as error:
                    print(
                        f"Could not generate embedding for job "
                        f"{job['job_id']}: {error}"
                    )

            connection.commit()

            print("\nEmbedding generation completed.")
            print(f"Successfully generated: {success_count}")
            print(f"Total jobs requiring embeddings: {len(jobs)}")

    except Exception:
        connection.rollback()
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    generate_existing_job_embeddings()
