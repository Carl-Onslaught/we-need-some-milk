#!/bin/bash
set -e

echo "Creating application user '$MONGODB_USER' for database '$MONGODB_NAME'..."

mongosh "mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@localhost:27017/admin" <<EOF
use $MONGODB_NAME
db.createUser({
  user: "$MONGODB_USER",
  pwd: "$MONGODB_PASSWORD",
  roles: [{ role: "dbOwner", db: "$MONGODB_NAME" }]
});
EOF