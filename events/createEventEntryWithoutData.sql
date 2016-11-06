INSERT INTO {{table_name}} ({{identifier_name}}, happened_at)
     VALUES ($1::{{identifier_type}}, $2::timestamp)
