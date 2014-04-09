#!/bin/bash

#Cache the token for future use
#Command to get expire time:
#FIXME: better way to get expiration time
#grep "expires_at" token.tmp | cut -d',' -f8 | cut -d'"' -f4
#date -d"$(grep "expires_at" token.tmp | cut -d',' -f8 | cut -d'"' -f4)" +%s
CACHE_FILE=/tmp/cache.tmp

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <user>.<user_domain> "\
         "<project>.<project_domain>" >&2
    exit 1
fi

if [[ -n "$1" ]]; then
    USER=$(echo $1 | cut -f1 -d'.')
    USER_DOMAIN=$(echo $1 | cut -f2 -d'.')
fi
if [[ -n "$2" ]]; then
    PROJECT=$(echo $2 | cut -f1 -d'.')
    PROJECT_DOMAIN=$(echo $2 | cut -f2 -d'.')
fi

REQ_DATA='{"auth":{"identity":{"methods":["password"],"password":{"user":{"domain":{"name":"'$USER_DOMAIN'"},"name":"'$USER'","password":"admin"}}},"scope":{"project":{"domain":{"name":"'$PROJECT_DOMAIN'"},"name":"'$PROJECT'"}}}}'
#echo "REQ_DATA: "$REQ_DATA

START=$(($(time +%s%N)/1000000))
curl -si http://10.245.122.64:5000/v3/auth/tokens -X POST \
-H "Content-Type: application/json" -H "Accept: application/json" -d \
$REQ_DATA
END=$(($(time +%s%N)/1000000))
#echo '{"time":5}'
TIME=$(($END-$START))
echo '{"time":$TIME}'

TOKEN_REF=$(grep "token" $CACHE_FILE)
#echo $TOKEN_REF
TOKEN=$(awk '/X-Subject-Token: / {print $2;}' $CACHE_FILE)
export OS_TOKEN=$TOKEN

case $3 in
    user-projects) curl -i http://10.245.122.64:5000/v3/users/$4/projects -X GET -H "Content-Type: application/json" -H "Accept: application/json" -H "X-Auth-Token:$TOKEN";;
    user-list) curl -i http://10.245.122.64:5000/v3/users/?domain_id=3ef3fd89b1b44feb9c11d920889ef918 -X GET -H "Content-Type: application/json" -H "Accept: application/json" -H "X-Auth-Token:$TOKEN";;
    server-list) curl -i http://10.245.122.64:8774/v2/$4/servers -X GET -H "Content-Type: application/json" -H "Accept: application/json" -H "X-Auth-Token:$TOKEN";;
    domain-user-roles) curl -i http://10.245.122.64:5000/v3/domains/$4/users/$5/roles -X GET -H "Content-Type: application/json" -H "Accept: application/json" -H "X-Auth-Token:$TOKEN";;
    project-user-roles) curl -i http://10.245.122.64:5000/v3/projects/$4/users/$5/roles -X GET -H "Content-Type: application/json" -H "Accept: application/json" -H "X-Auth-Token:$TOKEN";;
    server-list) curl -i http://10.245.122.64:8774/v2/0f8e507ee44d44ee8eb0a8509929e165/servers -X GET -H "Content-Type: application/json" -H "Accept: application/json" -H "X-Auth-Token:$TOKEN";;
esac

# Lists roles for a user on a domain.
# v3/domains/{domain_id}/users/{user_id}/roles
