-- Insert test data for 360° Feedback Tab
-- Employee ID: dddddddd-3333-4444-5555-cccccccccccc
-- Reviewer ID (Manager): cccccccc-2222-3333-4444-bbbbbbbbbbbb

-- Insert Performance Review for Q4 2025
INSERT INTO performance_reviews (
  id,
  employee_id,
  reviewer_id,
  review_period_start,
  review_period_end,
  status,
  overall_score,
  due_date,
  scores,
  feedback,
  metadata,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-1111-2222-3333-444444444444',
  'dddddddd-3333-4444-5555-cccccccccccc',
  'cccccccc-2222-3333-4444-bbbbbbbbbbbb',
  '2025-10-01',
  '2025-12-31',
  'in_progress',
  4.4,
  '2025-12-15',
  '{
    "self": 4.3,
    "manager": 4.5,
    "peers": 4.4,
    "directs": null,
    "competencies": {
      "fachliche_kompetenz": {"self": 4.0, "manager": 4.5, "peers": 4.3, "trend": 0.3},
      "teamarbeit": {"self": 4.5, "manager": 4.8, "peers": 4.7, "trend": 0.8},
      "kommunikation": {"self": 4.0, "manager": 4.2, "peers": 4.1, "trend": 0.0},
      "leadership": {"self": 3.5, "manager": 4.0, "peers": 3.8, "trend": 0.4},
      "innovation": {"self": 4.1, "manager": 4.0, "peers": 4.1, "trend": -0.2}
    }
  }',
  '{
    "sources": {
      "self": {"status": "completed", "completed_at": "2025-10-28", "rating": 4.3},
      "manager": {"status": "completed", "completed_at": "2025-10-29", "rating": 4.5, "reviewer_name": "Dr. Schmidt"},
      "peers": {"status": "completed", "completed_at": "2025-10-30", "rating": 4.4, "count": 3},
      "directs": {"status": "pending", "due_date": "2025-11-10", "count": 2},
      "final_meeting": {"status": "scheduled", "scheduled_date": "2025-12-15"}
    },
    "strengths": [
      "Exzellente technische Fähigkeiten",
      "Starke Teamplayer-Mentalität",
      "Proaktive Problemlösung",
      "Gute Mentoring-Fähigkeiten"
    ],
    "areas_for_improvement": [
      "Zeitmanagement bei Deadlines",
      "Delegation von Aufgaben",
      "Öffentliche Präsentationen"
    ],
    "development_goals": [
      "Leadership Skills ausbauen",
      "Strategisches Denken fördern",
      "Stakeholder Management"
    ],
    "peer_comments": {
      "positive": [
        "Immer hilfsbereit bei technischen Problemen",
        "Bringt innovative Lösungsansätze ein",
        "Gute Code-Review-Qualität"
      ],
      "improvements": [
        "Könnte bei Meetings aktiver kommunizieren",
        "Mehr Fokus auf Dokumentation",
        "Früher um Hilfe bitten wenn nötig"
      ]
    }
  }',
  '{
    "progress": {
      "completed": 3,
      "total": 5,
      "percentage": 60
    }
  }',
  NOW(),
  NOW()
);