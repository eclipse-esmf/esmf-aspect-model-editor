#!/bin/bash -x

INPUT=$1
ENTITLEMENTS=$2
NEEDS_UNZIP=false

# if input contains "ame-backend", do nothing
if [[ $INPUT == *"ame-backend"* ]]; then
    exit 0
fi

# if folder, zip it
if [ -d "${INPUT}" ]; then
    NEEDS_UNZIP=true
    zip -r -q -y unsigned.zip "${INPUT}"
    rm -rf "${INPUT}"
    INPUT=unsigned.zip
fi

# sign with curl
curl -o "${INPUT}" -F file=@"${INPUT}" -F entitlements=@"${ENTITLEMENTS}" https://cbi.eclipse.org/macos/codesign/sign

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
