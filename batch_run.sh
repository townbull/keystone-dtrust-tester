#!/bin/bash

ext=1
ksx=0

# Keystone servers with capability of 2 to the power of each number
KS0="10.245.122.97"
KS1="10.245.122.98"
KS2="10.245.122.99"
KS3="10.245.123.32"
KS4="10.245.123.54"

# Database server for experiment result storage
DB="10.245.122.14"

KSRST="cd /opt/stack/keystone; git pull; ./ksrestart.sh"

while [ $ksx -lt 5 ]
do

    KSX="KS$ksx"
    KSX=${!KSX}

    while [ $ext -le 10 ]
    do
        # restart expriment keystone server
        ssh -o "StrictHostKeyChecking no" root@$KSX $KSRST

        # execute intra-domain experiment
        ./run_exp.sh $ksx -i $ext
        
        # wait result arrive the db
        exp_num=`expr $ext * 100`
        resp_num=0
        timeout=0
        while [ $resp_num -lt $exp_num ]
        do
            sleep 10
            resp_num=$(/usr/bin/mysql -uroot -padmin -h$DB -N -e "use osacdt;select count(*) \
                from dt_exp_results where id like \"$ksx-I$ext-%\";")
            timeout=`expr $timeout + 1`
            if [ $timeout -lt 100 ]
            then
                echo "Time out in $ksx-I$ext-xxx."
                break
            fi
        done

        # restart expriment keystone server
        ssh -o "StrictHostKeyChecking no" root@$KSX $KSRST


        # execute cross-domain experiment
        ./run_exp.sh $ksx -c $ext

        # wait result arrive the db
        exp_num=`expr $ext * 100`
        resp_num=0
        timeout=0
        while [ $resp_num -lt $exp_num ]
        do
            sleep 10
            resp_num=$(/usr/bin/mysql -uroot -padmin -h$DB -N -e "use osacdt;select count(*) \
                from dt_exp_results where id like \"$ksx-C$ext-%\";")
            timeout=`expr $timeout + 1`
            if [ $timeout -lt 100 ]
            then
                echo "Time out in $ksx-C$ext-xxx."
                break
            fi
        done

        ext=`expr $ext + 1`
    done

    ksx=`expr $ksx + 1`
done

echo "Batch teses ends at: $(date +%Y%m%d-%T)"
exit 0
