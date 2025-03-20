import requests
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

def scrape_leetcode_problem(container_id):
    """
    Scrape problem description from LeetCode based on container_id
    Returns title and description if successful
    """
    try:
        # Format the URL with the container_id
        url = f"https://leetcode.com/problems/{container_id}/"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract title - this might need adjustment based on LeetCode's actual HTML structure
        title_element = soup.select_one('div[data-cy="question-title"]')
        title = title_element.text.strip() if title_element else "Unknown Title"
        
        # Extract description - this might need adjustment based on LeetCode's actual HTML structure
        description_element = soup.select_one('div[data-cy="question-content"]')
        description = description_element.get_text(strip=True) if description_element else "Description not found"
        
        return {
            "title": title,
            "description": description
        }
    except Exception as e:
        logger.error(f"Error scraping LeetCode problem {container_id}: {str(e)}")
        raise Exception(f"Failed to scrape problem: {str(e)}")