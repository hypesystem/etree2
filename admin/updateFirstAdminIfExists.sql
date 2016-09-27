UPDATE admin_created
   SET data=$1::json, happened_at=$2::timestamp
 WHERE id='10aeed75-db22-4432-bbb5-630262e16bd5';
