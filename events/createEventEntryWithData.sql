INSERT INTO {{table_name}} ({{identifier_name}}, data, happened_at)
     VALUES ($1::{{identifier_type}}, $2::json, $3::timestamp)
