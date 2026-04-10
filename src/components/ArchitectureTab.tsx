import React from 'react';

export default function ArchitectureTab() {
  return (
    <div className="p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-stone-800">System Architecture</h2>
        <p className="text-sm text-stone-500">mAgri-Platform WebApp Design</p>
      </div>

      <div className="space-y-4">
        <Section title="1. Architecture Diagram">
          <pre className="bg-stone-900 text-stone-300 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
{`graph TD
    A[Smartphone/Feature Phone] -->|USSD/Web Bridge| B(API Gateway)
    B --> C{Middleware Logic}
    
    C -->|Text Queries| D[Linguistic AI Engine]
    D -->|Fine-tuned LLM| E[(AfriInstruct DB)]
    
    C -->|Images| F[Diagnostic CV]
    F -->|Tiny-LiteNet <1.2MB| G{Confidence > 90%?}
    G -->|Yes| H[Auto Response]
    G -->|No| I[Human Agronomist Queue]
    
    C -->|Payments| J[Fintech Integration]
    J --> K[Orange Money API]
    J --> L[MTN MoMo API]
    
    C --> M[Alternative Credit Scoring]
    M --> N[(Yield & Usage DB)]`}
          </pre>
        </Section>

        <Section title="2. Database Schema (SDG Alignment)">
          <pre className="bg-stone-900 text-stone-300 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
{`// User Impact Tracking (SDG 1: No Poverty, SDG 2: Zero Hunger)
Table users {
  id uuid PK
  phone_number varchar
  region varchar // e.g., "Zambia", "Côte d'Ivoire"
  preferred_language varchar // "Setswana", "Bemba"
  credit_score int // Alternative score
  created_at timestamp
}

Table diagnostics {
  id uuid PK
  user_id uuid FK
  crop_type varchar
  disease_detected varchar
  confidence_score float
  escalated_to_human boolean
  timestamp timestamp
}

Table financial_transactions {
  id uuid PK
  user_id uuid FK
  provider varchar // "Orange Money", "MTN MoMo"
  type varchar // "Micro-credit", "Insurance"
  amount decimal
  status varchar
  timestamp timestamp
}`}
          </pre>
        </Section>

        <Section title="3. Fintech API Handler Snippet">
          <pre className="bg-stone-900 text-stone-300 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
{`// Express.js API Handler for Mobile Money
app.post('/api/finance/disburse', async (req, res) => {
  const { userId, amount, provider } = req.body;
  
  // 1. Check Alternative Credit Score
  const userScore = await getCreditScore(userId);
  if (userScore < 600) {
    return res.status(403).json({ error: 'Credit score too low' });
  }

  // 2. Route to appropriate provider
  try {
    let paymentRes;
    if (provider === 'ORANGE_MONEY') {
      paymentRes = await orangeMoneyApi.transfer({
        recipient: userId, amount, currency: 'XOF'
      });
    } else if (provider === 'MTN_MOMO') {
      paymentRes = await mtnMomoApi.disburse({
        payee: userId, amount, currency: 'ZMW'
      });
    }
    
    // 3. Log transaction for SDG tracking
    await db.financial_transactions.insert({
      user_id: userId, provider, amount, status: 'SUCCESS'
    });
    
    res.json({ success: true, transactionId: paymentRes.id });
  } catch (err) {
    res.status(500).json({ error: 'Transaction failed' });
  }
});`}
          </pre>
        </Section>

        <Section title="4. AI Escalation Logic Snippet">
          <pre className="bg-stone-900 text-stone-300 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
{`// Middleware for Human-AI Escalation
async function processCropImage(imageBuffer, userId) {
  // 1. Run lightweight CV model (Tiny-LiteNet)
  const result = await tinyLiteNet.predict(imageBuffer);
  
  // 2. Check confidence threshold
  if (result.confidence < 0.90) {
    // Escalate to human
    const ticketId = await humanAgronomistQueue.push({
      userId,
      image: imageBuffer,
      preliminary_diagnosis: result.disease,
      confidence: result.confidence
    });
    
    // Notify user via SMS/USSD bridge
    await notifyUser(userId, 
      "Your image is being reviewed by an expert. " +
      "We will SMS you the results shortly."
    );
    
    return { status: 'ESCALATED', ticketId };
  }
  
  // 3. Auto-respond if confident
  return { 
    status: 'AUTO_RESOLVED', 
    diagnosis: result.disease,
    recommendation: getTreatment(result.disease)
  };
}`}
          </pre>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-stone-800 text-sm">{title}</h3>
      {children}
    </div>
  );
}
