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
ASG[0]="I"
ASG[1]="C"


ksx=0
while [ $ksx -lt 5 ]
do

    KSX="KS$ksx"
    KSX=${!KSX}

    ic=0
    while [ $ic -lt 2 ]
    do
        
        echo -e "\n $ksx-${ASG[ic]}x-xxx"
        echo "========================"
        ext=1
        while [ $ext -le 10 ]
        do
     
            avg_time=$(mysql -uroot -padmin -h$DB -N -e "use osacdt;\
            select avg(resp_time) from dt_exp_results where id like \"$ksx-${ASG[ic]}$ext-%\";")
            echo $avg_time

            ext=`expr $ext + 1`
        done

        ic=`expr $ic + 1`
    done

    ksx=`expr $ksx + 1`
done

echo "Batch teses ends at: $(date +%Y%m%d-%T)"
exit 0
