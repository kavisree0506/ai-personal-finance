import os
from dotenv import load_dotenv
from pathlib import Path
from fastapi import HTTPException
from .logger import setup_logger

logger = setup_logger(__name__)

load_dotenv(Path(__file__).parents[1] / ".env")

try:
    import google.generativeai as genai
except ImportError:
    genai = None
    logger.warning("Optional module google.generativeai is not installed. AI advice will use fallback responses.")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY and genai:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as exc:
        logger.warning(f"Failed to configure Gemini API: {exc}")


def is_ai_configured():
    """Return true if Gemini is configured or fallback AI responses are available."""
    return bool(genai is not None or GEMINI_API_KEY)


async def call_openai_chat(system: str, user_prompt: str) -> str:
    """Generate AI advice using Gemini when configured, otherwise use fallback responses."""
    try:
        if GEMINI_API_KEY and genai:
            model = genai.GenerativeModel("gemini-2.0-flash")

            prompt = f"""
            {system}

            User Question:
            {user_prompt}
            """

            response = model.generate_content(prompt)

            logger.debug("Gemini response received")
            if response and hasattr(response, "text"):
                return response.text

        raise Exception("Gemini unavailable or not configured")

    except Exception:

        question = user_prompt.lower()

        if "save" in question:
            return """
💰 Financial Savings Tips

1. Follow the 50-30-20 budgeting rule.
2. Save at least 20% of your monthly income.
3. Reduce unnecessary subscriptions.
4. Track all expenses daily.
5. Build an emergency fund covering 3-6 months of expenses.
"""

        elif "investment" in question:
            return """
📈 Investment Suggestions

1. Start with SIP investments.
2. Diversify your portfolio.
3. Invest regularly every month.
4. Avoid emotional investing.
5. Focus on long-term growth.
"""

        elif "budget" in question:
            return """
📊 Budget Planning Tips

1. Track income and expenses.
2. Set monthly spending limits.
3. Prioritize essential expenses.
4. Allocate money for savings first.
5. Review your budget every month.
"""

        else:
            return f"""
🤖 AI Financial Advisor

Based on your question:

'{user_prompt}'

General Financial Advice:

• Track your expenses regularly.
• Maintain an emergency fund.
• Avoid unnecessary debt.
• Save consistently every month.
• Invest for long-term goals.
"""