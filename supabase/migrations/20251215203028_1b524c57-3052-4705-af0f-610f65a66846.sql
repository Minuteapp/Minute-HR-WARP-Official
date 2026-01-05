-- Erweitere den sick_leave_status Enum mit den fehlenden Werten
ALTER TYPE sick_leave_status ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE sick_leave_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE sick_leave_status ADD VALUE IF NOT EXISTS 'rejected';