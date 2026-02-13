# AI Type Mapping: When Each Applies

FinanceFlo deploys three categories of AI technology, each suited to different business problems. The AIBA diagnostic helps determine which AI types are most relevant for each client.

## Machine Learning (ML)

**What it is**: Statistical models trained on historical data to make predictions or classifications.

**Best for**:
- Revenue forecasting and cash flow prediction
- Customer churn prediction
- Anomaly detection in transactions
- Credit risk scoring
- Demand planning and inventory optimisation
- Classification tasks (expense categorisation, document type identification)

**When to recommend**:
- Business has 12+ months of clean historical data
- The problem is predictive in nature ("What will happen?")
- Pattern recognition across large datasets
- Continuous improvement as more data is collected

**Common implementations**:
- Cash flow forecasting models (ARIMA, LSTM)
- Transaction anomaly detection (isolation forests)
- Revenue prediction (gradient boosting, time series)
- Customer segmentation (clustering)

**Data requirements**: Minimum 1,000 data points for basic models; 10,000+ for robust predictions. Data quality is critical — garbage in, garbage out.

## Agentic AI

**What it is**: AI systems that can plan, reason, and take actions autonomously across multiple steps to accomplish goals.

**Best for**:
- Complex document processing (invoices, contracts, proposals)
- Multi-step workflow automation
- Research and analysis tasks
- Report generation from multiple data sources
- Customer support and query resolution
- Financial close process orchestration

**When to recommend**:
- Tasks require multiple steps and decision points
- Current process involves human judgment on semi-structured data
- Need to interact with multiple systems/APIs
- Process currently requires a skilled human but is repeatable
- Quality and consistency matter (reducing human error)

**Common implementations**:
- Intelligent AP processing (receive → match → approve → pay)
- Automated financial reporting (gather → analyse → narrate → distribute)
- AI business analyst queries against company data
- Compliance checking across multiple regulations
- Meeting preparation and briefing generation

**Key consideration**: Agentic AI requires clear guardrails, human oversight for high-stakes decisions, and well-defined process boundaries.

## Reinforcement Learning (RL)

**What it is**: AI that learns optimal strategies through trial and feedback, continuously improving its decisions.

**Best for**:
- Dynamic pricing optimisation
- Resource allocation across competing priorities
- Portfolio rebalancing
- Supply chain optimisation
- A/B testing and marketing optimisation
- Trading strategy development

**When to recommend**:
- The optimal decision changes based on environment/market conditions
- Many possible actions with non-obvious best choices
- Fast feedback loops available (daily/hourly results)
- The cost of suboptimal decisions is quantifiable
- The business has appetite for algorithmic decision-making

**Common implementations**:
- Dynamic pricing engines for professional services
- Working capital optimisation (payment timing, investment allocation)
- Marketing spend allocation across channels
- Resource scheduling and capacity planning

**Data requirements**: Real-time or near-real-time feedback mechanism. Simulation environment for safe training. Higher technical complexity than ML or Agentic AI.

## Selection Matrix

| Business Need | Primary AI Type | Secondary |
|---|---|---|
| Predict future revenue | ML | - |
| Automate invoice processing | Agentic AI | ML (extraction) |
| Optimise pricing | RL | ML (demand prediction) |
| Generate financial reports | Agentic AI | ML (anomaly flagging) |
| Detect fraud | ML | Agentic AI (investigation) |
| Manage cash flow | ML | RL (optimisation) |
| Automate month-end close | Agentic AI | ML (reconciliation matching) |
| Customer segmentation | ML | - |
| Dynamic resource planning | RL | ML (demand forecasting) |

## Implementation Priority

For most businesses, the recommended order is:
1. **ML** — foundational predictions and analytics (quick wins)
2. **Agentic AI** — process automation (highest ROI)
3. **RL** — optimisation (advanced, requires mature data infrastructure)
