#!/bin/bash -x

INPUT=$1
APP_ID=$2
ROOT_DIR=$3
NEEDS_UNZIP=false
UUID_REGEX='"uuid"\s*:\s*"([^"]+)'
STATUS_REGEX='"status"\s*:\s*"([^"]+)'

# if folder, zip it
if [ -d "${INPUT}" ]; then
    NEEDS_UNZIP=true
    zip -r -q -y unsigned.zip "${INPUT}"
    rm -rf "${INPUT}"
    INPUT=unsigned.zip
fi

# notarize over curl
RESPONSE=$(curl -X POST -F file=@"${ROOT_DIR}/${INPUT}" -F 'options={"primaryBundleId": "'${APP_ID}'", "staple": true};type=application/json' https://cbi.eclipse.org/macos/xcrun/notarize)

# fund uuid and status
[[ $RESPONSE =~ $UUID_REGEX ]]
UUID=${BASH_REMATCH[1]}
[[ $RESPONSE =~ $STATUS_REGEX ]]
STATUS=${BASH_REMATCH[1]}

# poll progress
echo "  Progress: $RESPONSE"
while [[ $STATUS == 'IN_PROGRESS' ]]; do
    sleep 120
    RESPONSE=$(curl -s https://cbi.eclipse.org/macos/xcrun/${UUID}/status)
    [[ $RESPONSE =~ $STATUS_REGEX ]]
    STATUS=${BASH_REMATCH[1]}
    echo "  Progress: $RESPONSE"
done

if [[ $STATUS != 'COMPLETE' ]]; then
    echo "Notarization failed: $RESPONSE"
    exit 1
fi

# download stapled result
mkdir -p "${ROOT_DIR}/notarized"
RESPONSE=$(curl -o "${ROOT_DIR}/notarized/${INPUT}" https://cbi.eclipse.org/macos/xcrun/${UUID}/download)

ls -a "${ROOT_DIR}"
ls -a "${ROOT_DIR}/notarized"

# if unzip needed
if [ "$NEEDS_UNZIP" = true ]; then
    unzip -qq "notarized/${INPUT}"

    if [ $? -ne 0 ]; then
        # echo contents if unzip failed
        output=$(cat "${ROOT_DIR}/notarized/${INPUT}")
        echo "$output"
        exit 1
    fi

    rm -f "${ROOT_DIR}/notarized/${INPUT}"
fi
