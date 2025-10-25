flowchart TD
    A[Start] --> B[Receive WhatsApp Message]
    B --> C{First Interaction}
    C -->|Yes| D[Send Welcome and Ask RGPD Consent]
    C -->|No| E[Proceed to Main Menu]
    D --> F{Consent Given}
    F -->|Yes| G[Store Consent in Supabase]
    F -->|No| H[Request Consent Again]
    G --> I[Show Main Menu]
    E --> I
    I --> J[Option Search Products]
    I --> K[Option Health Advice]
    I --> L[Option View Promotions]
    J --> M[Needs Identification Questions]
    K --> M
    L --> M
    M --> N[Generate Recommendations with GPT4o]
    N --> O[Display Recommendations]
    O --> P{Human Advisor Needed}
    P -->|Yes| Q[Trigger Human Handoff]
    P -->|No| R[Add to Cart or External Link]
    Q --> S[Send Alert and Notify Dashboard]
    R --> T[Generate Cart Link]
    T --> U[Send Link to Customer]
    U --> V{Payment Completed}
    V -->|Yes| W[Send Confirmation and Tracking]
    V -->|No| X[Send Payment Reminder]
    W --> Y[Post Purchase Follow up]
    X --> Y
    Y --> Z[End]