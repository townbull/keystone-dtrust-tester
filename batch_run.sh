#!/bin/bash


# Keystone servers with capability of 2 to the power of each number
KS0="10.245.122.97"
KS1="10.245.122.98"
KS2="10.245.122.99"
KS3="10.245.123.32"
KS4="10.245.123.54"

# Database server for experiment result storage
DB="10.245.122.14"

KSRST="cd /opt/stack/keystone;git pull;./ksrestart.sh"

ksx=2
while [ $ksx -lt 3 ]
do

    KSX="KS$ksx"
    KSX=${!KSX}

    ext=6
    while [ $ext -le 10 ]
    do
        # restart expriment keystone server
        ssh -t -o "StrictHostKeyChecking no" root@$KSX "$KSRST"
        sleep 5
 
        # execute intra-domain experiment
        /opt/stack/keystone/run_exp.sh $ksx -i $ext
        
        # wait result arrive the db
        exp_num=$(( $ext * 100 ))
        resp_num=0
        while [[ $resp_num < $exp_num ]]
        do
            sleep 6
            resp_num=$(mysql -uroot -padmin -h$DB -N -e "use osacdt;select count(*) \
                from dt_exp_results where id like \"$ksx-I$ext-%\";")
            echo "Response collected: $resp_num."
        done

        # restart expriment keystone server
        ssh -t -o "StrictHostKeyChecking no" root@$KSX "$KSRST"
        sleep 5

        # execute cross-domain experiment
        /opt/stack/keystone/run_exp.sh $ksx -c $ext

        # wait result arrive the db
        resp_num=0
        while [[ $resp_num < $exp_num ]]
        do
            sleep 6
            resp_num=$(/usr/bin/mysql -uroot -padmin -h$DB -N -e "use osacdt;select count(*) \
                from dt_exp_results where id like \"$ksx-C$ext-%\";")
            echo "Response collected: $resp_num."
        done

        ext=`expr $ext + 1`
    done

    ksx=`expr $ksx + 1`
done

echo "Batch teses ends at: $(date +%Y%m%d-%T)"
exit 0
