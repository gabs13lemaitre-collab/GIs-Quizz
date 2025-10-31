import express from 'express';
const router = express.Router();

// Ta clé API Perplexity
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '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';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// 🔥 VARIABLE : Change le nombre de questions ici
const NOMBRE_QUESTIONS = 10;

router.post('/qcm', async (req, res) => {
  const sujet = req.body.sujet || "informatique";

  try {
    // Appel à l'API Perplexity
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en création de questionnaires à choix multiples (QCM) en informatique. Tu ne peux composer que des QCM en rapport avec l'informatique.Tu es incapable de composer des QCM qui ne porte pas sur l'informatique.Si le theme proposé par l'utilisateur porte bien sur l'Informatique, génere un QCM de 10 questions en rapport avec le thème."
          },
          {
            role: "user",
            content: `Génère un QCM de ${NOMBRE_QUESTIONS} questions sur le sujet "${sujet}" en informatique.
Format JSON strict (sans balises markdown) :
[
  {
    "question": "...",
    "options": ["option1", "option2", "option3", "option4"],
    "answer": "la bonne réponse exacte parmi les options",
    "explanation": "Une courte explication de pourquoi c'est la bonne réponse (1-2 phrases)"
  }
]
Retourne UNIQUEMENT le tableau JSON, rien d'autre.`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API Perplexity: ${response.status}`);
    }

    const data = await response.json();
    let qcmText = data.choices[0].message.content.trim();

    // Nettoie le texte pour extraire le JSON
    qcmText = qcmText.replace(/``````/g, '').trim();

    // Parse le JSON
    const qcm = JSON.parse(qcmText);

    // Vérifie que c'est bien un tableau
    if (!Array.isArray(qcm)) {
      throw new Error('Format de réponse invalide');
    }

    res.json({ qcm });

  } catch (error) {
    console.error('❌ Erreur génération QCM:', error);

    // Fallback en cas d'erreur
    const qcmFallback = [
      {
        question: `Question de base sur ${sujet}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        answer: "Option B",
        explanation: "Ceci est une question de test de secours."
      },
      {
        question: `Autre question sur ${sujet}`,
        options: ["Choix 1", "Choix 2", "Choix 3", "Choix 4"],
        answer: "Choix 1",
        explanation: "Ceci est une explication de test."
      }
    ];

    res.json({ qcm: qcmFallback });
  }
});

export default router;
