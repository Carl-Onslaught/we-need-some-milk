set -e

mongosh <<EOF
var db = connect("mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@localhost:27017/admin")
db = db.getSiblingDB('$MONGODB_NAME')

db.createUser({
  user: '$MONGODB_USER',
  pwd: '$MONGODB_PASSWORD',
  roles: [{ role: 'dbOwner', db: '$MONGODB_NAME' }],
});
EOF
# ...rest of your entrypoint script, e.g.:
exec "$@"