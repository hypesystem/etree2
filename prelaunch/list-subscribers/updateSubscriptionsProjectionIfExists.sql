UPDATE projection
   SET data=$1::json, updated_at=$2::timestamp
 WHERE type='subscriptions';
