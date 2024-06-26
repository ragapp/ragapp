import requests


agent_endpoints = {
    "vietnam": "http://localhost:8001",
    "thailand": "http://localhost:8002",
    "main": "http://localhost:8000",
}

if __name__ == "__main__":
    question = "Give me some places in South East Asia for vacation"

    agent_answers = {}
    for country, endpoint in agent_endpoints.items():
        response = requests.post(
            f"{endpoint}/api/chat/request",
            json={
                "messages": [
                    {
                        "content": "The customer need some places for vacation, please give me some suggestions",
                        "role": "user",
                    }
                ]
            },
        )
        answer = response.json()["result"]["content"]
        agent_answers[country] = answer
    agent_answers = "\n".join(
        [f"{country}: {answer}" for country, answer in agent_answers.items()]
    )
    final_answer = requests.post(
        f"{agent_endpoints['main']}/api/chat/request",
        json={
            "messages": [
                {
                    "content": f"The agents in Vietnam and Thailand have provided you some information: ${agent_answers} \nUse it to answer the customer: ${question}\n\nFinal answer:",
                    "role": "user",
                }
            ]
        },
    ).json()["result"]["content"]

    print(final_answer)

    # """
    # Final Answer:
    # For a vacation in Southeast Asia, here are some great places to visit:

    # In Vietnam:
    # 1. Hanoi: Known for its centuries-old architecture and vibrant street life.
    # 2. Ho Chi Minh City: A bustling metropolis with a mix of modern skyscrapers and historic landmarks.
    # 3. Hoi An: A charming ancient town with well-preserved architecture and lantern-lit streets.
    # 4. Hue: A city steeped in history and culture, with the UNESCO-listed Imperial City.
    # 5. Da Nang: Popular for its beautiful beaches and modern attractions.
    # 6. Sapa: A picturesque town in the mountains known for its terraced rice fields and ethnic minority villages.

    # In Thailand:
    # 1. Bangkok: The vibrant capital city with cultural landmarks and delicious street food.
    # 2. Chiang Mai: Famous for its temples, lush mountains, and rich cultural heritage.
    # 3. Phuket: Thailand's largest island, perfect for beach lovers.
    # 4. Krabi: Known for its dramatic limestone cliffs and beautiful islands.
    # 5. Pattaya: A coastal city with lively nightlife and beautiful beaches.

    # These destinations offer a mix of cultural experiences, natural beauty, and vibrant city life, making them ideal for a memorable vacation in Southeast Asia.
    # """
