# Architecture adjustments to export namespaces as a package

## Context and Problem Statement

* New package management necessitates options to export/download a zip file to the local file system.
* This task is usually handled by the backend but is currently facing limitations due to minimal windows privileges, restricting saving to user-chosen locations.
* The frontend (electron) allows users to freely choose a download location, creating a discrepancy with backend restrictions.

### Consequences:

* Potential compromise in UI flexibility and accuracy in the package export/download area.
* Possible security risks due to privilege alterations.
* Potential startup issues requiring admin rights.
* Possible conflicts with corporate policy procedures.

## Influences

### Key Features:

* **Exporting** should be intuitive, requiring minimal user interaction.
* **Backend Generation** is crucial due to frontend resource constraints.
* Aiming to maintain a **Simple and Intuitive UI.**

### Influencing Factors:

* **Intuitive UI Maintenance.**
* The ability to start the application **without admin rights.**

## Considered Options

### Strategy for Changing Frontend/Backend/UX for Package Management:

#### 1. More Frontend Logic:

1.1. Construct zip file completely in frontend.
1.2. Backend generates the package and passes the information to the frontend.

#### 2. More Backend Service Privileges:

2.1. User freely chooses any download location.
2.2. User decides service rights at installation or runtime.

#### 3. Restrict UI to Current Constraints:

3.1. Limit user’s download locations choice.
3.2. Auto-generate packages in the download folder.

### Proposal to Stop Separation Between Workspace/Exports; Manual Zip:

* Suggestion to end the separation between internal workspace and user-visible space.

### Proposal to Offer Zip and/or Namespace Folder:

* Provide options for exporting packages in zip or folder format.

## Decision Outcome

Decisions are aimed at enhancing user experience while maintaining security and functionality integrity, avoiding unnecessary complexities, and maintaining user-friendly interactions within the UI. Proper documentation and error handling are pivotal for effective implementation.

### 1. First Design Decision:

* **Chosen Approach:** 1.1 Frontend receives structure from the backend.
* **Reasoning:** Avoids security implications and UI restrictions; simpler realization.
* **Comments:** Backend will create a BLOB file; frontend will generate the package file.

### 2. Second Design Decision:

* **Result:** Proposal accepted.
* **Reasoning:** Makes CLI processing easier; workspace is not blocked, just hidden.
* **Comments:** Clear documentation of user responsibility and improved error handling are essential.

### 3. Third Design Decision:

* **Result:** Rejected.
* **Reasoning:** Export with a folder structure is uncommon and unnecessary.
