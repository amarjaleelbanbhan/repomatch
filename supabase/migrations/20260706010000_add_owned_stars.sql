-- FR-4.8: "total stars across owned repos" needed for the OSS Activity Card, computed nightly by the indexer
alter table users add column owned_stars integer not null default 0;
