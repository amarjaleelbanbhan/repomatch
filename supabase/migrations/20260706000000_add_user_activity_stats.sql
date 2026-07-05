-- OSS Activity Card pivot (SRS FR-4.8-4.11): installer's own stats become the widget's primary content
alter table users
  add column contribution_streak integer not null default 0,
  add column total_contributions integer not null default 0,
  add column last_active_at timestamptz;
