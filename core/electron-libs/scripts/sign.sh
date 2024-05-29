#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2
NEEDS_UNZIP=false

pwd

# if folder, zip it
if [ -d "${INPUT}" ]; then
    NEEDS_UNZIP=true
    zip -r -q -y unsigned.zip "${INPUT}"
    rm -rf "${INPUT}"
    INPUT=unsigned.zip
fi

# sign with curl
curl -o "temp-${INPUT}" -F file=@"${INPUT}" -F entitlements=@"${ENTITLEMENTS}" https://cbi.eclipse.org/macos/codesign/sign

pwd

ls -a

# remove the original file
rm -f "${INPUT}"

pwd

ls -a

# rename the temporary file to the original file name
mv "temp-${INPUT}" "${INPUT}"

pwd

ls -a

# if unzip needed
if [ "$NEEDS_UNZIP" = true ]; then
    unzip -qq "${INPUT}"

    if [ $? -ne 0 ]; then
        # echo contents if unzip failed
        output=$(cat "${INPUT}")
        echo "$output"
        exit 1
    fi

    rm -f "${INPUT}"
fi
