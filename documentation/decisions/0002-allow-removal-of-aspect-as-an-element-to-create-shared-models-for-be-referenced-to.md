# Allow removal of Aspect as an element to create "shared" models for be referenced to

## Context and Problem Statement

- AME does not currently support models without the Aspect to be created in advance.
- User cannot start a new Model without the default Model containing an Aspect
- A better overview of the shared models in the editor - easier to differentiate which files are specifically made for sharing.
- User should be able to create a .ttl file without the need to include an Aspect if the purpose of the file is just to include (share) the elements for other models

## Influences

_The key features to be considered are:_

- Switching between an Aspect Model and a Shared Model should be easy and intuitive
- Not over-complicate the interface
- The name of the file must be automatically set with the option to manually name the file if the user wants to do so
- The basic flow of AME should not be affected for models that do not use the Shared Models feature
- Users must be able to create Aspect Models just like before without any extra steps

_Further aspects to be considered are:_

- Because Shared Models do not have an Aspect from which the file name is given, a new method must be implemented.

## Assumptions

_Risks that we are facing:_

- Confusing way of automatically naming the files
- Possible unexpected side effects of removing the Aspect from a model - from the code perspective

## Considered Options

_Which alternative options did you consider?_

- Add a new toggle switch to the toolbar to make the file a Shared Model or an Aspect Model
- Make the Aspect removable and add it to the New Elements sidebar so the user can drag&drop back to the Model.

_How do you judge each one?_

- How intuitive it is for the user to use the feature
- How many steps required to switch between a Shared Model and an Aspect Model

## Option 1: Toolbar toggle switch

The toggle decides in which mode we are at the moment - here you can decide between an AspectModel or a SharedModel.

If the user toggles from Aspect Model to Shared Model a confirmation will be displayed describing the action (the aspect will be removed and all the connections between the aspect and the connected elements will be lost and the user has the option to name the file of the Shared Model).

When the user saves the file, he will be prompted to name the file or to skip this step and automatically assign a default unique file name. The default naming will look like this: SharedModel1, SharedModel2, etc.

Each Shared Model file must have a different icon displayed in the Workspace.

_Advantages:_

- The user decides which mode he wants to be in.
- Knows exactly what he has to do because he can choose the mode freely.

_Disadvantages:_

- If the user wants to switch from AspectModel to SharedModel and back to AspectModel and wants the old relationships to be reconnected, it will be difficult to implement this after the user has done some changes.
- Extra element in the toolbar

## Option 2: Aspect as individual element

The aspect becomes an independent element and can be created in the editor like the other elements. As a result, it is possible to create an empty editor and the user can create it completely.

An Aspect element can be added or removed. A confirmation dialog will be displayed to the user describing the action and effects.

Each Shared Model file must have a different icon displayed in the Workspace.

When the user saves the file, he will be prompted to name the file or to skip this step and automatically assign a default unique file name. The default naming will look like this: SharedModel1, SharedModel2, etc.

_Advantages:_

- The user can remove the Aspect and make the file a Shared Model
- User will be aware that he deletes the Aspect because a confirmation dialog will be displayed describing his actions
- No extra actions in the toolbar

_Disadvantages:_

- The user must know that deleting an Aspect from a Model will make it a Shared Model and might not know in which mode he is in
- Extra element in the new element sidebar

## Decision Outcome

Based on a thorough evaluation of user-centered design, interface simplicity, and development feasibility, the choice is made to implement Option 2: Aspect as Individual Element for enhancing the user experience and functionality of the Aspect Model Editor (AME). This approach advocates for making the Aspect an independent and manageable entity within the editor, allowing users to initiate a shared model without mandating an Aspect creation.
