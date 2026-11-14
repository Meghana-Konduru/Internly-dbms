
from pydantic import BaseModel, Field


class ResumeTextRequest(BaseModel):
    resume_text: str = Field(
        min_length=20,
        max_length=20000,
        description="Extracted plain text from the student's resume"
    )
