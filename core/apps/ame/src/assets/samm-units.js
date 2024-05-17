/*
 * Copyright (c) 2024 Robert Bosch Manufacturing Solutions GmbH
 *
 * See the AUTHORS file(s) distributed with this work for
 * additional information regarding authorship.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

var sammUDefinition = {
  quantityKinds: {
    absoluteActivity: {name: 'absoluteActivity', label: 'absolute activity'},
    absorbance: {name: 'absorbance', label: 'absorbance'},
    absorbedDose: {name: 'absorbedDose', label: 'absorbed dose'},
    absorbedDoseRate: {name: 'absorbedDoseRate', label: 'absorbed dose rate'},
    absorptionFactor: {name: 'absorptionFactor', label: 'absorption factor'},
    acceleration: {name: 'acceleration', label: 'acceleration'},
    accelerationDueToGravity: {name: 'accelerationDueToGravity', label: 'acceleration due to gravity'},
    accelerationOfFreeFall: {name: 'accelerationOfFreeFall', label: 'acceleration of free fall'},
    acceptorIonizationEnergy: {name: 'acceptorIonizationEnergy', label: 'acceptor ionization energy'},
    acceptorNumberDensity: {name: 'acceptorNumberDensity', label: 'acceptor number density'},
    acousticImpedance: {name: 'acousticImpedance', label: 'acoustic impedance'},
    activeEnergy: {name: 'activeEnergy', label: 'active energy'},
    activePower: {name: 'activePower', label: 'active power'},
    activity: {name: 'activity', label: 'activity'},
    activityCoefficientOfBInALiquidAsASolidMixture: {
      name: 'activityCoefficientOfBInALiquidAsASolidMixture',
      label: 'activity coefficient of B (in a liquid as a solid mixture)'
    },
    activityCoefficientOfSoluteBEspeciallyInADiluteSolution: {
      name: 'activityCoefficientOfSoluteBEspeciallyInADiluteSolution',
      label: 'activity coefficient of solute B (especially in a dilute solution)'
    },
    activityConcentration: {name: 'activityConcentration', label: 'activity concentration'},
    activityOfSolventA: {name: 'activityOfSolventA', label: 'activity of solvent A'},
    admittance: {name: 'admittance', label: 'admittance'},
    affinityOfAChemicalReaction: {name: 'affinityOfAChemicalReaction', label: 'affinity (of a chemical reaction)'},
    alfvenNumber: {name: 'alfvenNumber', label: 'Alfven number'},
    alphaDisintegrationEnergy: {name: 'alphaDisintegrationEnergy', label: 'alpha disintegration energy'},
    amountOfSubstance: {name: 'amountOfSubstance', label: 'amount of substance'},
    angleOfOpticalRotation: {name: 'angleOfOpticalRotation', label: 'angle of optical rotation'},
    anglePlane: {name: 'anglePlane', label: 'angle (plane)'},
    angularAcceleration: {name: 'angularAcceleration', label: 'angular acceleration'},
    angularCrossSection: {name: 'angularCrossSection', label: 'angular cross-section'},
    angularFrequency: {name: 'angularFrequency', label: 'angular frequency'},
    angularImpulse: {name: 'angularImpulse', label: 'angular impulse'},
    angularMomentum: {name: 'angularMomentum', label: 'angular momentum'},
    angularReciprocalLatticeVector: {
      name: 'angularReciprocalLatticeVector',
      label: 'angular reciprocal lattice vector'
    },
    angularRepetency: {name: 'angularRepetency', label: 'angular repetency'},
    angularVelocity: {name: 'angularVelocity', label: 'angular velocity'},
    angularWaveNumber: {name: 'angularWaveNumber', label: 'angular wave number'},
    angularWavenumber: {name: 'angularWavenumber', label: 'angular wavenumber'},
    apparentPower: {name: 'apparentPower', label: 'apparent power'},
    area: {name: 'area', label: 'area'},
    areaRelatedTorsionalMoment: {name: 'areaRelatedTorsionalMoment', label: 'area-related torsional moment'},
    areicMass: {name: 'areicMass', label: 'areic mass'},
    atomicAttenuationCoefficient: {name: 'atomicAttenuationCoefficient', label: 'atomic attenuation coefficient'},
    atomicNumber: {name: 'atomicNumber', label: 'atomic number'},
    attenuationCoefficient: {name: 'attenuationCoefficient', label: 'attenuation coefficient'},
    averageLogarithmicEnergyDecrement: {
      name: 'averageLogarithmicEnergyDecrement',
      label: 'average logarithmic energy decrement'
    },
    avogadroConstant: {name: 'avogadroConstant', label: 'Avogadro constant'},
    betaDisintegrationEnergy: {name: 'betaDisintegrationEnergy', label: 'beta disintegration energy'},
    bindingFraction: {name: 'bindingFraction', label: 'binding fraction'},
    bohrMagneton: {name: 'bohrMagneton', label: 'Bohr magneton'},
    bohrRadius: {name: 'bohrRadius', label: 'Bohr radius'},
    boltzmannConstant: {name: 'boltzmannConstant', label: 'Boltzmann constant'},
    braggAngle: {name: 'braggAngle', label: 'Bragg angle'},
    breadth: {name: 'breadth', label: 'breadth'},
    bulkCompressibility: {name: 'bulkCompressibility', label: 'bulk compressibility'},
    bulkModulus: {name: 'bulkModulus', label: 'bulk modulus'},
    burgersVector: {name: 'burgersVector', label: 'Burgers vector'},
    burstIndex: {name: 'burstIndex', label: 'burst index'},
    canonicalPartitionFunction: {name: 'canonicalPartitionFunction', label: 'canonical partition function'},
    capacitance: {name: 'capacitance', label: 'capacitance'},
    carrierLifeTime: {name: 'carrierLifeTime', label: 'carrier life time'},
    cartesianCoordinates: {name: 'cartesianCoordinates', label: 'cartesian coordinates'},
    catalyticActivity: {name: 'catalyticActivity', label: 'catalytic activity'},
    characteristicImpedanceOfAMedium: {
      name: 'characteristicImpedanceOfAMedium',
      label: 'characteristic impedance of a medium'
    },
    chargeDensity: {name: 'chargeDensity', label: 'charge density'},
    chargeNumberOfIon: {name: 'chargeNumberOfIon', label: 'charge number of ion'},
    chemicalPotential: {name: 'chemicalPotential', label: 'chemical potential'},
    cieColorimetricFunctions: {name: 'cieColorimetricFunctions', label: 'CIE colorimetric functions'},
    circularFrequency: {name: 'circularFrequency', label: 'circular frequency'},
    coefficient: {name: 'coefficient', label: 'coefficient'},
    coefficientOfFriction: {name: 'coefficientOfFriction', label: 'coefficient of friction'},
    coefficientOfHeatTransfer: {name: 'coefficientOfHeatTransfer', label: 'coefficient of heat transfer'},
    coefficientOfThermalInsulation: {
      name: 'coefficientOfThermalInsulation',
      label: 'coefficient of thermal insulation'
    },
    coherenceLength: {name: 'coherenceLength', label: 'coherence length'},
    complexAdmittance: {name: 'complexAdmittance', label: 'complex admittance'},
    complexImpedances: {name: 'complexImpedances', label: 'complex impedances'},
    compressibility: {name: 'compressibility', label: 'compressibility'},
    comptonWavelength: {name: 'comptonWavelength', label: 'Compton wavelength'},
    concentrationOfB: {name: 'concentrationOfB', label: 'concentration of B'},
    conductanceForAlternatingCurrent: {
      name: 'conductanceForAlternatingCurrent',
      label: 'conductance (for alternating current)'
    },
    conductanceForDirectCurrent: {name: 'conductanceForDirectCurrent', label: 'conductance (for direct current)'},
    conductivity: {name: 'conductivity', label: 'conductivity'},
    coordinatesTrichromatic: {name: 'coordinatesTrichromatic', label: 'coordinates trichromatic'},
    couplingCoefficient: {name: 'couplingCoefficient', label: 'coupling coefficient'},
    cowlingNumber: {name: 'cowlingNumber', label: 'Cowling number'},
    crossSection: {name: 'crossSection', label: 'cross-section'},
    cubicExpansionCoefficient: {name: 'cubicExpansionCoefficient', label: 'cubic expansion coefficient'},
    curieTemperature: {name: 'curieTemperature', label: 'Curie temperature'},
    currentDensity: {name: 'currentDensity', label: 'current density'},
    currentDensityOfParticles: {name: 'currentDensityOfParticles', label: 'current density of particles'},
    currentFractionOfIonB: {name: 'currentFractionOfIonB', label: 'current fraction of ion B'},
    currentLinkage: {name: 'currentLinkage', label: 'current linkage'},
    curvature: {name: 'curvature', label: 'curvature'},
    cyclotronAngularFrequency: {name: 'cyclotronAngularFrequency', label: 'cyclotron angular frequency'},
    dampingCoefficient: {name: 'dampingCoefficient', label: 'damping coefficient'},
    dataRate: {name: 'dataRate', label: 'Data rate'},
    debyeAngularFrequency: {name: 'debyeAngularFrequency', label: 'Debye angular frequency'},
    debyeAngularRepetency: {name: 'debyeAngularRepetency', label: 'Debye angular repetency'},
    debyeAngularWaveNumber: {name: 'debyeAngularWaveNumber', label: 'Debye angular wave number'},
    debyeTemperature: {name: 'debyeTemperature', label: 'Debye temperature'},
    debyeWalleFactor: {name: 'debyeWalleFactor', label: 'Debye-Walle factor'},
    decayConstant: {name: 'decayConstant', label: 'decay constant'},
    degreeOfDissociation: {name: 'degreeOfDissociation', label: 'degree of dissociation'},
    density: {name: 'density', label: 'density'},
    densityOfHeatFlowRate: {name: 'densityOfHeatFlowRate', label: 'density of heat flow rate'},
    densityOfStates: {name: 'densityOfStates', label: 'density of states'},
    diameter: {name: 'diameter', label: 'diameter'},
    diffusionArea: {name: 'diffusionArea', label: 'diffusion area'},
    diffusionCoefficient: {name: 'diffusionCoefficient', label: 'diffusion coefficient'},
    diffusionCoefficientForNeutronFluenceRate: {
      name: 'diffusionCoefficientForNeutronFluenceRate',
      label: 'diffusion coefficient for neutron fluence rate'
    },
    diffusionCoefficientForNeutronFluxDensity: {
      name: 'diffusionCoefficientForNeutronFluxDensity',
      label: 'diffusion coefficient for neutron flux density'
    },
    diffusionCoefficientForNeutronNumberDensity: {
      name: 'diffusionCoefficientForNeutronNumberDensity',
      label: 'diffusion coefficient for neutron number density'
    },
    diffusionLength: {name: 'diffusionLength', label: 'diffusion length'},
    dimensionless: {name: 'dimensionless', label: 'dimensionless'},
    directionalSpectralEmissivity: {name: 'directionalSpectralEmissivity', label: 'directional spectral emissivity'},
    disintegrationConstant: {name: 'disintegrationConstant', label: 'disintegration constant'},
    displacementElectricPolarization: {
      name: 'displacementElectricPolarization',
      label: 'displacement electric polarization'
    },
    displacementVectorOfIonOrAtom: {
      name: 'displacementVectorOfIonOrAtom',
      label: 'displacement vector of ion or atom'
    },
    dissipance: {name: 'dissipance', label: 'dissipance'},
    dissipationFactor: {name: 'dissipationFactor', label: 'dissipation factor'},
    distance: {name: 'distance', label: 'distance'},
    donorIonizationEnergy: {name: 'donorIonizationEnergy', label: 'donor ionization energy'},
    donorNumberDensity: {name: 'donorNumberDensity', label: 'donor number density'},
    doseEquivalent: {name: 'doseEquivalent', label: 'dose equivalent'},
    effectiveMass: {name: 'effectiveMass', label: 'effective mass'},
    effectiveMultiplicationFactor: {name: 'effectiveMultiplicationFactor', label: 'effective multiplication factor'},
    electricCharge: {name: 'electricCharge', label: 'electric charge'},
    electricConstant: {name: 'electricConstant', label: 'electric constant'},
    electricCurrent: {name: 'electricCurrent', label: 'electric current'},
    electricDipoleMoment: {name: 'electricDipoleMoment', label: 'electric dipole moment'},
    electricDipoleMomentOfMolecule: {
      name: 'electricDipoleMomentOfMolecule',
      label: 'electric dipole moment of molecule'
    },
    electricFieldStrength: {name: 'electricFieldStrength', label: 'electric field strength'},
    electricFluxDensity: {name: 'electricFluxDensity', label: 'electric flux density'},
    electricFluxFluxOfDisplacement: {
      name: 'electricFluxFluxOfDisplacement',
      label: 'electric flux (flux of displacement)'
    },
    electricPolarizabilityOfAMolecule: {
      name: 'electricPolarizabilityOfAMolecule',
      label: 'electric polarizability of a molecule'
    },
    electricPotential: {name: 'electricPotential', label: 'electric potential'},
    electricSusceptibility: {name: 'electricSusceptibility', label: 'electric susceptibility'},
    electrolyticConductivity: {name: 'electrolyticConductivity', label: 'electrolytic conductivity'},
    electromagneticEnergyDensity: {name: 'electromagneticEnergyDensity', label: 'electromagnetic energy density'},
    electromagneticMoment: {name: 'electromagneticMoment', label: 'electromagnetic moment'},
    electromotiveForce: {name: 'electromotiveForce', label: 'electromotive force'},
    electronAffinity: {name: 'electronAffinity', label: 'electron affinity'},
    electronNumberDensity: {name: 'electronNumberDensity', label: 'electron number density'},
    electronRadius: {name: 'electronRadius', label: 'electron radius'},
    elementaryCharge: {name: 'elementaryCharge', label: 'elementary charge'},
    emissivity: {name: 'emissivity', label: 'emissivity'},
    emissivityAtASpecifiedWavelength: {
      name: 'emissivityAtASpecifiedWavelength',
      label: 'emissivity at a specified wavelength'
    },
    energy: {name: 'energy', label: 'energy'},
    energyDensity: {name: 'energyDensity', label: 'energy density'},
    energyFluence: {name: 'energyFluence', label: 'energy fluence'},
    energyFluenceRate: {name: 'energyFluenceRate', label: 'energy fluence rate'},
    energyFluxDensity: {name: 'energyFluxDensity', label: 'energy flux density'},
    energyImparted: {name: 'energyImparted', label: 'energy imparted'},
    enthalpy: {name: 'enthalpy', label: 'enthalpy'},
    entropy: {name: 'entropy', label: 'entropy'},
    equilibriumPositionVectorOfIonOrAtom: {
      name: 'equilibriumPositionVectorOfIonOrAtom',
      label: 'equilibrium position vector of ion or atom'
    },
    equivalenceDoseOutput: {name: 'equivalenceDoseOutput', label: 'equivalence dose output'},
    equivalentAbsorptionAreaOfASurfaceOrObject: {
      name: 'equivalentAbsorptionAreaOfASurfaceOrObject',
      label: 'equivalent absorption area of a surface or object'
    },
    eulerNumber: {name: 'eulerNumber', label: 'Euler number'},
    exchangeIntergral: {name: 'exchangeIntergral', label: 'exchange intergral'},
    exposure: {name: 'exposure', label: 'exposure'},
    exposureRate: {name: 'exposureRate', label: 'exposure rate'},
    fahrenheitTemperature: {name: 'fahrenheitTemperature', label: 'fahrenheit temperature'},
    faradayConstant: {name: 'faradayConstant', label: 'Faraday constant'},
    fastFissionFactor: {name: 'fastFissionFactor', label: 'fast fission factor'},
    fermiAngularRepetency: {name: 'fermiAngularRepetency', label: 'Fermi angular repetency'},
    fermiAngularWaveNumber: {name: 'fermiAngularWaveNumber', label: 'Fermi angular wave number'},
    fermiEnergy: {name: 'fermiEnergy', label: 'Fermi energy'},
    fermiTemperature: {name: 'fermiTemperature', label: 'Fermi temperature'},
    fineStructureConstant: {name: 'fineStructureConstant', label: 'fine structure constant'},
    firstRadiationConstant: {name: 'firstRadiationConstant', label: 'first radiation constant'},
    fluenceRate: {name: 'fluenceRate', label: 'fluence rate'},
    focalDistance: {name: 'focalDistance', label: 'focal distance'},
    force: {name: 'force', label: 'force'},
    forceDividedByLength: {name: 'forceDividedByLength', label: 'force divided by length'},
    fourierNumber: {name: 'fourierNumber', label: 'Fourier number'},
    fourierNumberForMassTransfer: {name: 'fourierNumberForMassTransfer', label: 'Fourier number for mass transfer'},
    frequency: {name: 'frequency', label: 'frequency'},
    frequencyInterval: {name: 'frequencyInterval', label: 'frequency interval'},
    frictionFactor: {name: 'frictionFactor', label: 'friction factor'},
    froudeNumber: {name: 'froudeNumber', label: 'Froude number'},
    fugacityOfBInAGaseousMixture: {
      name: 'fugacityOfBInAGaseousMixture',
      label: 'fugacity of B (in a gaseous mixture)'
    },
    fundamentalLatticeVector: {name: 'fundamentalLatticeVector', label: 'fundamental lattice vector'},
    fundamentalReciprocalLatticeVector: {
      name: 'fundamentalReciprocalLatticeVector',
      label: 'fundamental reciprocal lattice vector'
    },
    gFactorOfAtomOrElectron: {name: 'gFactorOfAtomOrElectron', label: 'g-factor of atom or electron'},
    gFactorOfNucleus: {name: 'gFactorOfNucleus', label: 'g-factor of nucleus'},
    gapEnergy: {name: 'gapEnergy', label: 'gap energy'},
    grandCanonicalPartitionFunction: {
      name: 'grandCanonicalPartitionFunction',
      label: 'grand-canonical partition function'
    },
    grandPartitionFunction: {name: 'grandPartitionFunction', label: 'grand partition function'},
    grashofNumber: {name: 'grashofNumber', label: 'Grashof number'},
    grashofNumberForMassTransfer: {name: 'grashofNumberForMassTransfer', label: 'Grashof number for mass transfer'},
    gravitationalConstant: {name: 'gravitationalConstant', label: 'gravitational constant'},
    groupVelocity: {name: 'groupVelocity', label: 'group velocity'},
    grueneisenParameter: {name: 'grueneisenParameter', label: 'Grüneisen parameter'},
    gyromagneticCoefficient: {name: 'gyromagneticCoefficient', label: 'gyromagnetic coefficient'},
    gyromagneticRatio: {name: 'gyromagneticRatio', label: 'gyromagnetic ratio'},
    halfLife: {name: 'halfLife', label: 'half life'},
    halfThickness: {name: 'halfThickness', label: 'half-thickness'},
    halfValueThickness: {name: 'halfValueThickness', label: 'half-value thickness'},
    hallCoefficient: {name: 'hallCoefficient', label: 'Hall coefficient'},
    hardnessIndex: {name: 'hardnessIndex', label: 'hardness index'},
    hartmannNumber: {name: 'hartmannNumber', label: 'Hartmann number'},
    hartreeEnergy: {name: 'hartreeEnergy', label: 'Hartree energy'},
    heat: {name: 'heat', label: 'heat'},
    heatCapacity: {name: 'heatCapacity', label: 'heat capacity'},
    heatFlowRate: {name: 'heatFlowRate', label: 'heat flow rate'},
    height: {name: 'height', label: 'height'},
    helmholtzFreeEnergy: {name: 'helmholtzFreeEnergy', label: 'Helmholtz free energy'},
    helmholtzFunction: {name: 'helmholtzFunction', label: 'Helmholtz function'},
    holeNumberDensity: {name: 'holeNumberDensity', label: 'hole number density'},
    hyperfineStructureQuantumNumber: {
      name: 'hyperfineStructureQuantumNumber',
      label: 'hyperfine structure quantum number'
    },
    illuminance: {name: 'illuminance', label: 'illuminance'},
    imageDistance: {name: 'imageDistance', label: 'image distance'},
    impedance: {name: 'impedance', label: 'impedance'},
    impulse: {name: 'impulse', label: 'impulse'},
    infiniteMediumMultiplicationFactor: {
      name: 'infiniteMediumMultiplicationFactor',
      label: 'infinite medium multiplication factor'
    },
    informationEntropy: {name: 'informationEntropy', label: 'Information entropy'},
    instantaneousSoundParticleAcceleration: {
      name: 'instantaneousSoundParticleAcceleration',
      label: '(instantaneous) sound particle acceleration'
    },
    instantaneousSoundParticleDisplacement: {
      name: 'instantaneousSoundParticleDisplacement',
      label: '(instantaneous) sound particle displacement'
    },
    instantaneousSoundParticleVelocity: {
      name: 'instantaneousSoundParticleVelocity',
      label: '(instantaneous) sound particle velocity'
    },
    instantaneousSoundPressure: {name: 'instantaneousSoundPressure', label: '(instantaneous) sound pressure'},
    instantaneousVolumeFlowRate: {name: 'instantaneousVolumeFlowRate', label: '(instantaneous) volume flow rate'},
    internalConversionFactor: {name: 'internalConversionFactor', label: 'internal conversion factor'},
    intrinsicNumberDensity: {name: 'intrinsicNumberDensity', label: 'intrinsic number density'},
    ionDensity: {name: 'ionDensity', label: 'ion density'},
    ionNumberDensity: {name: 'ionNumberDensity', label: 'ion number density'},
    ionicStrength: {name: 'ionicStrength', label: 'ionic strength'},
    irradiance: {name: 'irradiance', label: 'irradiance'},
    isentropicCompressibility: {name: 'isentropicCompressibility', label: 'isentropic compressibility'},
    isentropicExponent: {name: 'isentropicExponent', label: 'isentropic exponent'},
    isothermalCompressibility: {name: 'isothermalCompressibility', label: 'isothermal compressibility'},
    kinematicViscosity: {name: 'kinematicViscosity', label: 'kinematic viscosity'},
    kineticEnergy: {name: 'kineticEnergy', label: 'kinetic energy'},
    knudsenNumber: {name: 'knudsenNumber', label: 'Knudsen number'},
    landauGinzburgNumber: {name: 'landauGinzburgNumber', label: 'Landau-Ginzburg number'},
    larmorAngularFrequency: {name: 'larmorAngularFrequency', label: 'Larmor angular frequency'},
    latticePlaneSpacing: {name: 'latticePlaneSpacing', label: 'lattice plane spacing'},
    latticeVector: {name: 'latticeVector', label: 'lattice vector'},
    leakageCoefficient: {name: 'leakageCoefficient', label: 'leakage coefficient'},
    leakageRateOfGas: {name: 'leakageRateOfGas', label: 'leakage rate of gas'},
    length: {name: 'length', label: 'length'},
    lengthOfPath: {name: 'lengthOfPath', label: 'length of path'},
    lensPower: {name: 'lensPower', label: 'lens power'},
    lethargy: {name: 'lethargy', label: 'lethargy'},
    levelOfAFieldQuantity: {name: 'levelOfAFieldQuantity', label: 'level of a field quantity'},
    levelOfAPowerQuantity: {name: 'levelOfAPowerQuantity', label: 'level of a power quantity'},
    levelWidth: {name: 'levelWidth', label: 'level width'},
    lewisNumber: {name: 'lewisNumber', label: 'Lewis number'},
    lightExposure: {name: 'lightExposure', label: 'light exposure'},
    linearAbsorptionCoefficient: {name: 'linearAbsorptionCoefficient', label: 'linear absorption coefficient'},
    linearAttenuationCoefficient: {name: 'linearAttenuationCoefficient', label: 'linear attenuation coefficient'},
    linearDensity: {name: 'linearDensity', label: 'linear density'},
    linearElectricCurrentDensity: {name: 'linearElectricCurrentDensity', label: 'linear electric current density'},
    linearEnergyTransfer: {name: 'linearEnergyTransfer', label: 'linear energy transfer'},
    linearExpansionCoefficient: {name: 'linearExpansionCoefficient', label: 'linear expansion coefficient'},
    linearExtinctionCoefficient: {name: 'linearExtinctionCoefficient', label: 'linear extinction coefficient'},
    linearIonizationByAParticle: {name: 'linearIonizationByAParticle', label: 'linear ionization by a particle'},
    linearMass: {name: 'linearMass', label: 'linear mass'},
    linearStrain: {name: 'linearStrain', label: 'linear strain'},
    lineicCharge: {name: 'lineicCharge', label: 'lineic charge'},
    lineicElectricCurrent: {name: 'lineicElectricCurrent', label: 'lineic electric current'},
    lineicResistance: {name: 'lineicResistance', label: 'lineic resistance'},
    logarithmicDecrement: {name: 'logarithmicDecrement', label: 'logarithmic decrement'},
    londonPenetrationDepth: {name: 'londonPenetrationDepth', label: 'London penetration depth'},
    longRangeOrderParameter: {name: 'longRangeOrderParameter', label: 'long-range order parameter'},
    lossAngle: {name: 'lossAngle', label: 'loss angle'},
    loudness: {name: 'loudness', label: 'loudness'},
    loudnessLevel: {name: 'loudnessLevel', label: 'loudness level'},
    lowerCriticalMagneticFluxDensity: {
      name: 'lowerCriticalMagneticFluxDensity',
      label: 'lower critical magnetic flux density'
    },
    luminance: {name: 'luminance', label: 'luminance'},
    luminiousEfficacy: {name: 'luminiousEfficacy', label: 'luminious efficacy'},
    luminousEfficacyAtASpecifiedWavelength: {
      name: 'luminousEfficacyAtASpecifiedWavelength',
      label: 'luminous efficacy at a specified wavelength'
    },
    luminousEfficiency: {name: 'luminousEfficiency', label: 'luminous efficiency'},
    luminousEfficiencyAtASpecifiedWavelength: {
      name: 'luminousEfficiencyAtASpecifiedWavelength',
      label: 'luminous efficiency at a specified wavelength'
    },
    luminousExitance: {name: 'luminousExitance', label: 'luminous exitance'},
    luminousFlux: {name: 'luminousFlux', label: 'luminous flux'},
    luminousIntensity: {name: 'luminousIntensity', label: 'luminous intensity'},
    machNumber: {name: 'machNumber', label: 'Mach number'},
    macroscopicCrossSection: {name: 'macroscopicCrossSection', label: 'macroscopic cross-section'},
    macroscopicTotalCrossSection: {name: 'macroscopicTotalCrossSection', label: 'macroscopic total cross-section'},
    madelungConstant: {name: 'madelungConstant', label: 'Madelung constant'},
    magneticAreaMoment: {name: 'magneticAreaMoment', label: 'magnetic area moment'},
    magneticConstant: {name: 'magneticConstant', label: 'magnetic constant'},
    magneticDipoleMoment: {name: 'magneticDipoleMoment', label: 'magnetic dipole moment'},
    magneticFieldStrength: {name: 'magneticFieldStrength', label: 'magnetic field strength'},
    magneticFlux: {name: 'magneticFlux', label: 'magnetic flux'},
    magneticFluxDensity: {name: 'magneticFluxDensity', label: 'magnetic flux density'},
    magneticFluxQuantum: {name: 'magneticFluxQuantum', label: 'magnetic flux quantum'},
    magneticInduction: {name: 'magneticInduction', label: 'magnetic induction'},
    magneticMoment: {name: 'magneticMoment', label: 'magnetic moment'},
    magneticMomentOfParticle: {name: 'magneticMomentOfParticle', label: 'magnetic moment of particle'},
    magneticPolarization: {name: 'magneticPolarization', label: 'magnetic polarization'},
    magneticPotentialDifference: {name: 'magneticPotentialDifference', label: 'magnetic potential difference'},
    magneticQuantumNumber: {name: 'magneticQuantumNumber', label: 'magnetic quantum number'},
    magneticReynoldsNumber: {name: 'magneticReynoldsNumber', label: 'magnetic Reynolds number'},
    magneticSusceptibility: {name: 'magneticSusceptibility', label: 'magnetic susceptibility'},
    magneticVectorPotential: {name: 'magneticVectorPotential', label: 'magnetic vector potential'},
    magnetization: {name: 'magnetization', label: 'magnetization'},
    magnetomotiveForce: {name: 'magnetomotiveForce', label: 'magnetomotive force'},
    mass: {name: 'mass', label: 'mass'},
    massAttenuationCoefficient: {name: 'massAttenuationCoefficient', label: 'mass attenuation coefficient'},
    massConcentrationOfB: {name: 'massConcentrationOfB', label: 'mass concentration of B'},
    massDefect: {name: 'massDefect', label: 'mass defect'},
    massDensity: {name: 'massDensity', label: 'mass density'},
    massEnergyTransferCoefficient: {name: 'massEnergyTransferCoefficient', label: 'mass energy transfer coefficient'},
    massExcess: {name: 'massExcess', label: 'mass excess'},
    massFlowRate: {name: 'massFlowRate', label: 'mass flow rate'},
    massNumber: {name: 'massNumber', label: 'mass number'},
    massOfAtomOfANuclideX: {name: 'massOfAtomOfANuclideX', label: 'mass of atom (of a nuclide x)'},
    massOfMolecule: {name: 'massOfMolecule', label: 'mass of molecule'},
    massRatio: {name: 'massRatio', label: 'mass ratio'},
    massicEnergy: {name: 'massicEnergy', label: 'massic energy'},
    massicEnergyImparted: {name: 'massicEnergyImparted', label: 'massic energy imparted'},
    massicEnthalpy: {name: 'massicEnthalpy', label: 'massic enthalpy'},
    massicHelmholtzFreeEnergy: {name: 'massicHelmholtzFreeEnergy', label: 'massic Helmholtz free energy'},
    massicOptical: {name: 'massicOptical', label: 'massic optical'},
    massicThermodynamicEnergy: {name: 'massicThermodynamicEnergy', label: 'massic thermodynamic energy'},
    massicVolume: {name: 'massicVolume', label: 'massic volume'},
    massieuFunction: {name: 'massieuFunction', label: 'massieu function'},
    maximumBetaParticleEnergy: {name: 'maximumBetaParticleEnergy', label: 'maximum beta particle energy'},
    maximumSpectralLuminousEfficacy: {
      name: 'maximumSpectralLuminousEfficacy',
      label: 'maximum spectral luminous efficacy'
    },
    meanEnergyImparted: {name: 'meanEnergyImparted', label: 'mean energy imparted'},
    meanFreePath: {name: 'meanFreePath', label: 'mean free path'},
    meanFreePathOfPhononsOrElectrons: {
      name: 'meanFreePathOfPhononsOrElectrons',
      label: 'mean free path of phonons or electrons'
    },
    meanLife: {name: 'meanLife', label: 'mean life'},
    meanLinearRange: {name: 'meanLinearRange', label: 'mean linear range'},
    meanMassRange: {name: 'meanMassRange', label: 'mean mass range'},
    mechanicalImpedance: {name: 'mechanicalImpedance', label: 'mechanical impedance'},
    microcanonicalPartitionFunction: {
      name: 'microcanonicalPartitionFunction',
      label: 'microcanonical partition function'
    },
    migrationArea: {name: 'migrationArea', label: 'migration area'},
    migrationLength: {name: 'migrationLength', label: 'migration length'},
    mobility: {name: 'mobility', label: 'mobility'},
    mobilityRatio: {name: 'mobilityRatio', label: 'mobility ratio'},
    modulusOfAdmittance: {name: 'modulusOfAdmittance', label: 'modulus of admittance'},
    modulusOfCompression: {name: 'modulusOfCompression', label: 'modulus of compression'},
    modulusOfElasticity: {name: 'modulusOfElasticity', label: 'modulus of elasticity'},
    modulusOfImpedance: {name: 'modulusOfImpedance', label: 'modulus of impedance'},
    modulusOfRigidity: {name: 'modulusOfRigidity', label: 'modulus of rigidity'},
    molalityOfSoluteB: {name: 'molalityOfSoluteB', label: 'molality of solute B'},
    molarAbsorptionCoefficient: {name: 'molarAbsorptionCoefficient', label: 'molar absorption coefficient'},
    molarAttenuationCoefficient: {name: 'molarAttenuationCoefficient', label: 'molar attenuation coefficient'},
    molarConductivity: {name: 'molarConductivity', label: 'molar conductivity'},
    molarEntropy: {name: 'molarEntropy', label: 'molar entropy'},
    molarFlux: {name: 'molarFlux', label: 'molar flux'},
    molarGasConstant: {name: 'molarGasConstant', label: 'molar gas constant'},
    molarHeatCapacity: {name: 'molarHeatCapacity', label: 'molar heat capacity'},
    molarMass: {name: 'molarMass', label: 'molar mass'},
    molarOpticalRotatoryPower: {name: 'molarOpticalRotatoryPower', label: 'molar optical rotatory power'},
    molarThermodynamicEnergy: {name: 'molarThermodynamicEnergy', label: 'molar thermodynamic energy'},
    molarVolume: {name: 'molarVolume', label: 'molar volume'},
    moleFractionOfB: {name: 'moleFractionOfB', label: 'mole fraction of B'},
    moleRatioOfSoluteB: {name: 'moleRatioOfSoluteB', label: 'mole ratio of solute B'},
    molecularConcentrationOfB: {name: 'molecularConcentrationOfB', label: 'molecular concentration of B'},
    molecularPartitionFunction: {name: 'molecularPartitionFunction', label: 'molecular partition function'},
    momentOfACouple: {name: 'momentOfACouple', label: 'moment of a couple'},
    momentOfForce: {name: 'momentOfForce', label: 'moment of force'},
    momentOfInertiaDynamicMomentOfInertia: {
      name: 'momentOfInertiaDynamicMomentOfInertia',
      label: 'moment of inertia (dynamic moment of inertia)'
    },
    momentOfMomentum: {name: 'momentOfMomentum', label: 'moment of momentum'},
    momentum: {name: 'momentum', label: 'momentum'},
    multiplicationFactor: {name: 'multiplicationFactor', label: 'multiplication factor'},
    mutualInductance: {name: 'mutualInductance', label: 'mutual inductance'},
    neelTemperature: {name: 'neelTemperature', label: 'Néel temperature'},
    neutronFluenceRate: {name: 'neutronFluenceRate', label: 'neutron fluence rate'},
    neutronNumber: {name: 'neutronNumber', label: 'neutron number'},
    neutronNumberDensity: {name: 'neutronNumberDensity', label: 'neutron number density'},
    neutronSpeed: {name: 'neutronSpeed', label: 'neutron speed'},
    neutronYieldPerAbsorption: {name: 'neutronYieldPerAbsorption', label: 'neutron yield per absorption'},
    neutronYieldPerFission: {name: 'neutronYieldPerFission', label: 'neutron yield per fission'},
    neutronfluxDensity: {name: 'neutronfluxDensity', label: 'neutronflux density'},
    nonLeakageProbability: {name: 'nonLeakageProbability', label: 'non leakage probability'},
    normalStress: {name: 'normalStress', label: 'normal stress'},
    nuclearMagnetonOrnucleus: {name: 'nuclearMagnetonOrnucleus', label: 'nuclear magneton ornucleus'},
    nuclearPrecession: {name: 'nuclearPrecession', label: 'nuclear precession'},
    nuclearQuadrupoleMoment: {name: 'nuclearQuadrupoleMoment', label: 'nuclear quadrupole moment'},
    nuclearRadius: {name: 'nuclearRadius', label: 'nuclear radius'},
    nuclearSpinQuantumNumber: {name: 'nuclearSpinQuantumNumber', label: 'nuclear spin quantum number'},
    nucleonNumber: {name: 'nucleonNumber', label: 'nucleon number'},
    nuclidicMass: {name: 'nuclidicMass', label: 'nuclidic mass'},
    numberDensityOfMoleculesOrParticles: {
      name: 'numberDensityOfMoleculesOrParticles',
      label: 'number density of molecules  (or particles)'
    },
    numberOfMoleculesOrOtherElementaryEntities: {
      name: 'numberOfMoleculesOrOtherElementaryEntities',
      label: 'number of molecules or other elementary entities'
    },
    numberOfPairsOfPoles: {name: 'numberOfPairsOfPoles', label: 'number of pairs of poles'},
    numberOfPhases: {name: 'numberOfPhases', label: 'number of phases'},
    numberOfTurnsInAWinding: {name: 'numberOfTurnsInAWinding', label: 'number of turns in a winding'},
    nusseltNumber: {name: 'nusseltNumber', label: 'Nusselt number'},
    nusseltNumberForMassTransfer: {name: 'nusseltNumberForMassTransfer', label: 'Nusselt number for mass transfer'},
    objectDistance: {name: 'objectDistance', label: 'object distance'},
    opticalDensity: {name: 'opticalDensity', label: 'optical density'},
    orbitalAngularMomentumQuantumNumber: {
      name: 'orbitalAngularMomentumQuantumNumber',
      label: 'orbital angular momentum quantum number'
    },
    orderOfReflexion: {name: 'orderOfReflexion', label: 'order of reflexion'},
    osmoticCoefficientOfTheSolventAEspeciallyInADiluteSolution: {
      name: 'osmoticCoefficientOfTheSolventAEspeciallyInADiluteSolution',
      label: 'osmotic coefficient of the solvent A (especially in a dilute solution)'
    },
    osmoticPressure: {name: 'osmoticPressure', label: 'osmotic pressure'},
    packingFraction: {name: 'packingFraction', label: 'packing fraction'},
    partialPressureOfBInAGaseousMixture: {
      name: 'partialPressureOfBInAGaseousMixture',
      label: 'partial pressure of B (in a gaseous mixture)'
    },
    particalFluxDensity: {name: 'particalFluxDensity', label: 'partical flux density'},
    particleFluence: {name: 'particleFluence', label: 'particle fluence'},
    particleFluenceRate: {name: 'particleFluenceRate', label: 'particle fluence rate'},
    particlePositionVector: {name: 'particlePositionVector', label: 'particle position vector'},
    partitionFunctionOfAMolecule: {name: 'partitionFunctionOfAMolecule', label: 'partition function of a molecule'},
    pecletNumber: {name: 'pecletNumber', label: 'Peclet number'},
    pecletNumberForMassTransfer: {name: 'pecletNumberForMassTransfer', label: 'Peclet number for mass transfer'},
    peltierCoefficientForSubstancesAAndB: {
      name: 'peltierCoefficientForSubstancesAAndB',
      label: 'Peltier coefficient for substances a and b'
    },
    performanceCharacteristic: {name: 'performanceCharacteristic', label: 'performance characteristic'},
    period: {name: 'period', label: 'period'},
    periodicTime: {name: 'periodicTime', label: 'periodic time'},
    permeability: {name: 'permeability', label: 'permeability'},
    permeabilityOfVacuum: {name: 'permeabilityOfVacuum', label: 'permeability of vacuum'},
    permeance: {name: 'permeance', label: 'permeance'},
    permittivity: {name: 'permittivity', label: 'permittivity'},
    permittivityOfVacuum: {name: 'permittivityOfVacuum', label: 'permittivity of vacuum'},
    phaseCoefficient: {name: 'phaseCoefficient', label: 'phase coefficient'},
    phaseDifference: {name: 'phaseDifference', label: 'phase difference'},
    phaseDisplacement: {name: 'phaseDisplacement', label: 'phase displacement'},
    phaseSpeedOfElectromagneticWaves: {
      name: 'phaseSpeedOfElectromagneticWaves',
      label: 'phase speed of electromagnetic waves'
    },
    phaseVelocity: {name: 'phaseVelocity', label: 'phase velocity'},
    phaseVelocityOfElectromagneticWaves: {
      name: 'phaseVelocityOfElectromagneticWaves',
      label: 'phase velocity of electromagnetic waves'
    },
    photonExitance: {name: 'photonExitance', label: 'photon exitance'},
    photonExposure: {name: 'photonExposure', label: 'photon exposure'},
    photonFlux: {name: 'photonFlux', label: 'photon flux'},
    photonIntensity: {name: 'photonIntensity', label: 'photon intensity'},
    photonLuminance: {name: 'photonLuminance', label: 'photon luminance'},
    photonRadiance: {name: 'photonRadiance', label: 'photon radiance'},
    planckConstant: {name: 'planckConstant', label: 'Planck constant'},
    planckFunction: {name: 'planckFunction', label: 'planck function'},
    poissonNumber: {name: 'poissonNumber', label: 'poisson number'},
    poissonRatio: {name: 'poissonRatio', label: 'poisson ratio'},
    porosity: {name: 'porosity', label: 'porosity'},
    potentialDifference: {name: 'potentialDifference', label: 'potential difference'},
    potentialEnergy: {name: 'potentialEnergy', label: 'potential energy'},
    power: {name: 'power', label: 'power'},
    powerForDirectCurrent: {name: 'powerForDirectCurrent', label: 'power (for direct current)'},
    poyntingVector: {name: 'poyntingVector', label: 'Poynting vector'},
    prandtlNumber: {name: 'prandtlNumber', label: 'Prandtl number'},
    pressure: {name: 'pressure', label: 'pressure'},
    pressureCoefficient: {name: 'pressureCoefficient', label: 'pressure coefficient'},
    pressureRatio: {name: 'pressureRatio', label: 'pressure ratio'},
    principleQuantumNumber: {name: 'principleQuantumNumber', label: 'principle quantum number'},
    propagationCoefficient: {name: 'propagationCoefficient', label: 'propagation coefficient'},
    protonNumber: {name: 'protonNumber', label: 'proton number'},
    pulsatance: {name: 'pulsatance', label: 'pulsatance'},
    quantityOfElectricity: {name: 'quantityOfElectricity', label: 'quantity of electricity'},
    quantityOfHeat: {name: 'quantityOfHeat', label: 'quantity of heat'},
    quantityOfLight: {name: 'quantityOfLight', label: 'quantity of light'},
    radiance: {name: 'radiance', label: 'radiance'},
    radianceExposure: {name: 'radianceExposure', label: 'radiance exposure'},
    radiantEnergy: {name: 'radiantEnergy', label: 'radiant energy'},
    radiantEnergyDensity: {name: 'radiantEnergyDensity', label: 'radiant energy density'},
    radiantEnergyFluence: {name: 'radiantEnergyFluence', label: 'radiant energy fluence'},
    radiantEnergyflux: {name: 'radiantEnergyflux', label: 'radiant energyflux'},
    radiantExitance: {name: 'radiantExitance', label: 'radiant exitance'},
    radiantIntensity: {name: 'radiantIntensity', label: 'radiant intensity'},
    radiantPower: {name: 'radiantPower', label: 'radiant power'},
    radius: {name: 'radius', label: 'radius'},
    radiusOfCurvature: {name: 'radiusOfCurvature', label: 'radius of curvature'},
    ratioOfTheMassicHeatCapacity: {name: 'ratioOfTheMassicHeatCapacity', label: 'ratio of the massic heat capacity'},
    ratioOfTheSpecificHeatCapacities: {
      name: 'ratioOfTheSpecificHeatCapacities',
      label: 'ratio of the specific heat capacities'
    },
    rayleighNumber: {name: 'rayleighNumber', label: 'Rayleigh number'},
    reactance: {name: 'reactance', label: 'reactance'},
    reactionEnergy: {name: 'reactionEnergy', label: 'reaction energy'},
    reactivePower: {name: 'reactivePower', label: 'reactive power'},
    reactivity: {name: 'reactivity', label: 'reactivity'},
    reactorTimeConstant: {name: 'reactorTimeConstant', label: 'reactor time constant'},
    recombinationCoefficient: {name: 'recombinationCoefficient', label: 'recombination coefficient'},
    reflectance: {name: 'reflectance', label: 'reflectance'},
    reflectionFactor: {name: 'reflectionFactor', label: 'reflection factor'},
    refractiveIndex: {name: 'refractiveIndex', label: 'refractive index'},
    relativeActivityOfSolventAEspeciallyInADiluteSolution: {
      name: 'relativeActivityOfSolventAEspeciallyInADiluteSolution',
      label: 'relative activity of solvent A (especially in a dilute solution)'
    },
    relativeAtomicMass: {name: 'relativeAtomicMass', label: 'relative atomic mass'},
    relativeDensity: {name: 'relativeDensity', label: 'relative density'},
    relativeElongation: {name: 'relativeElongation', label: 'relative elongation'},
    relativeMassDefect: {name: 'relativeMassDefect', label: 'relative mass defect'},
    relativeMassDensity: {name: 'relativeMassDensity', label: 'relative mass density'},
    relativeMassExcess: {name: 'relativeMassExcess', label: 'relative mass excess'},
    relativeMolecularMass: {name: 'relativeMolecularMass', label: 'relative molecular mass'},
    relativePermeability: {name: 'relativePermeability', label: 'relative permeability'},
    relativePermittivity: {name: 'relativePermittivity', label: 'relative permittivity'},
    relativePressureCoefficient: {name: 'relativePressureCoefficient', label: 'relative pressure coefficient'},
    relaxationTime: {name: 'relaxationTime', label: 'relaxation time'},
    reluctance: {name: 'reluctance', label: 'reluctance'},
    repetency: {name: 'repetency', label: 'repetency'},
    residualResistivity: {name: 'residualResistivity', label: 'residual resistivity'},
    resistanceLoadPerUnitLength: {name: 'resistanceLoadPerUnitLength', label: 'resistance load per unit length'},
    resistanceToAlternatingCurrent: {
      name: 'resistanceToAlternatingCurrent',
      label: 'resistance (to alternating current)'
    },
    resistanceToDirectCurrent: {name: 'resistanceToDirectCurrent', label: 'resistance (to direct current)'},
    resistivity: {name: 'resistivity', label: 'resistivity'},
    resonanceEnergy: {name: 'resonanceEnergy', label: 'resonance energy'},
    resonanceEscapeProbability: {name: 'resonanceEscapeProbability', label: 'resonance escape probability'},
    restMassOfElectron: {name: 'restMassOfElectron', label: '(rest) mass of electron'},
    restMassOfNeutron: {name: 'restMassOfNeutron', label: '(rest) mass of neutron'},
    restMassOfProton: {name: 'restMassOfProton', label: '(rest) mass of proton'},
    reverberationTime: {name: 'reverberationTime', label: 'reverberation time'},
    reynoldsNumber: {name: 'reynoldsNumber', label: 'Reynolds number'},
    richardsonConstant: {name: 'richardsonConstant', label: 'Richardson constant'},
    rotationalFrequency: {name: 'rotationalFrequency', label: 'rotational frequency'},
    rotatoryPower: {name: 'rotatoryPower', label: 'rotatory power'},
    rydbergConstant: {name: 'rydbergConstant', label: 'Rydberg constant'},
    schmidtNumber: {name: 'schmidtNumber', label: 'Schmidt number'},
    secondAxialMomentOfArea: {name: 'secondAxialMomentOfArea', label: 'second axial moment of area'},
    secondMomentOfArea: {name: 'secondMomentOfArea', label: 'second moment of area'},
    secondPolarMomentOfArea: {name: 'secondPolarMomentOfArea', label: 'second polar moment of area'},
    secondRadiationConstant: {name: 'secondRadiationConstant', label: 'second radiation constant'},
    sectionModulus: {name: 'sectionModulus', label: 'section modulus'},
    seebeckCoefficientForSubstancesAAndB: {
      name: 'seebeckCoefficientForSubstancesAAndB',
      label: 'Seebeck coefficient for substances a and b'
    },
    selfInductance: {name: 'selfInductance', label: 'self inductance'},
    shearModulus: {name: 'shearModulus', label: 'shear modulus'},
    shearStrain: {name: 'shearStrain', label: 'shear strain'},
    shearStress: {name: 'shearStress', label: 'shear stress'},
    shortRangeOrderParameter: {name: 'shortRangeOrderParameter', label: 'short-range order parameter'},
    slowingDownArea: {name: 'slowingDownArea', label: 'slowing down area'},
    slowingDownDensity: {name: 'slowingDownDensity', label: 'slowing down density'},
    slowingDownLength: {name: 'slowingDownLength', label: 'slowing-down length'},
    solidAngle: {name: 'solidAngle', label: 'solid angle'},
    soundEnergy: {name: 'soundEnergy', label: 'sound energy'},
    soundEnergyDensity: {name: 'soundEnergyDensity', label: 'sound energy density'},
    soundExposure: {name: 'soundExposure', label: 'sound exposure'},
    soundIntensity: {name: 'soundIntensity', label: 'sound intensity'},
    soundPower: {name: 'soundPower', label: 'sound power'},
    soundPowerLevel: {name: 'soundPowerLevel', label: 'sound power level'},
    soundPressureLevel: {name: 'soundPressureLevel', label: 'sound pressure level'},
    soundReductionIndex: {name: 'soundReductionIndex', label: 'sound reduction index'},
    specificActivityInASample: {name: 'specificActivityInASample', label: 'specific activity in a sample'},
    specificEnergy: {name: 'specificEnergy', label: 'specific energy'},
    specificEnergyImparted: {name: 'specificEnergyImparted', label: 'specific energy imparted'},
    specificEnthalpy: {name: 'specificEnthalpy', label: 'specific enthalpy'},
    specificHeatCapacityAtConstantPressure: {
      name: 'specificHeatCapacityAtConstantPressure',
      label: 'specific heat capacity at constant pressure'
    },
    specificHeatCapacityAtConstantVolume: {
      name: 'specificHeatCapacityAtConstantVolume',
      label: 'specific heat capacity at constant volume'
    },
    specificHeatCapacityAtSaturation: {
      name: 'specificHeatCapacityAtSaturation',
      label: 'specific heat capacity at saturation'
    },
    specificOpticalRotatoryPower: {name: 'specificOpticalRotatoryPower', label: 'specific optical rotatory power'},
    specificThermodynamicEnergy: {name: 'specificThermodynamicEnergy', label: 'specific thermodynamic energy'},
    specificVolume: {name: 'specificVolume', label: 'specific volume'},
    spectralAbsorptance: {name: 'spectralAbsorptance', label: 'spectral absorptance'},
    spectralAbsorptionFactor: {name: 'spectralAbsorptionFactor', label: 'spectral absorption factor'},
    spectralAngularCrossSection: {name: 'spectralAngularCrossSection', label: 'spectral angular cross-section'},
    spectralConcentrationOfRadiantEnergyDensityInTermsOfWavelength: {
      name: 'spectralConcentrationOfRadiantEnergyDensityInTermsOfWavelength',
      label: 'spectral concentration of radiant energy density (in terms of wavelength)'
    },
    spectralConcentrationOfVibrationalModesInTermsOfAngularFrequency: {
      name: 'spectralConcentrationOfVibrationalModesInTermsOfAngularFrequency',
      label: 'spectral concentration of vibrational modes (in terms of angular frequency)'
    },
    spectralCrossSection: {name: 'spectralCrossSection', label: 'spectral cross-section'},
    spectralEmissivity: {name: 'spectralEmissivity', label: 'spectral emissivity'},
    spectralLuminousEfficacy: {name: 'spectralLuminousEfficacy', label: 'spectral luminous efficacy'},
    spectralLuminousEfficiency: {name: 'spectralLuminousEfficiency', label: 'spectral luminous efficiency'},
    spectralRadianceFactor: {name: 'spectralRadianceFactor', label: 'spectral radiance factor'},
    spectralRadiantEnergyDensityInTermsOfWaveLength: {
      name: 'spectralRadiantEnergyDensityInTermsOfWaveLength',
      label: 'spectral radiant energy density (in terms of wave length)'
    },
    spectralReflectance: {name: 'spectralReflectance', label: 'spectral reflectance'},
    spectralReflectionfactor: {name: 'spectralReflectionfactor', label: 'spectral reflectionfactor'},
    spectralTransmissionFactor: {name: 'spectralTransmissionFactor', label: 'spectral transmission factor'},
    spectralTransmittance: {name: 'spectralTransmittance', label: 'spectral transmittance'},
    spinAngularMomentumQuantumNumber: {
      name: 'spinAngularMomentumQuantumNumber',
      label: 'spin angular momentum quantum number'
    },
    standardAbsoluteActivityOfBInAGaseousMixture: {
      name: 'standardAbsoluteActivityOfBInAGaseousMixture',
      label: 'standard absolute activity of B (in a gaseous mixture)'
    },
    standardAbsoluteActivityOfBInALiquidOrASolidMixture: {
      name: 'standardAbsoluteActivityOfBInALiquidOrASolidMixture',
      label: 'standard absolute activity of B (in a liquid or a solid mixture)'
    },
    standardAbsoluteActivityOfSoluteBEspeciallyInADiluteSolution: {
      name: 'standardAbsoluteActivityOfSoluteBEspeciallyInADiluteSolution',
      label: 'standard absolute activity of solute B (especially in a dilute solution)'
    },
    standardAbsoluteActivityOfSolventAEspeciallyInADiluteSolution: {
      name: 'standardAbsoluteActivityOfSolventAEspeciallyInADiluteSolution',
      label: 'standard absolute activity of solvent A (especially in a dilute solution)'
    },
    standardEquilibriumConstant: {name: 'standardEquilibriumConstant', label: 'standard equilibrium constant'},
    stantonNumber: {name: 'stantonNumber', label: 'Stanton number'},
    stantonNumberForMassTransfer: {name: 'stantonNumberForMassTransfer', label: 'Stanton number for mass transfer'},
    staticPressure: {name: 'staticPressure', label: 'static pressure'},
    statisticalWeight: {name: 'statisticalWeight', label: 'statistical weight'},
    stefanBoltzmannConstant: {name: 'stefanBoltzmannConstant', label: 'Stefan-Boltzmann constant'},
    stoichiometricNumberOfB: {name: 'stoichiometricNumberOfB', label: 'stoichiometric number of B'},
    strouhalNumber: {name: 'strouhalNumber', label: 'Strouhal number'},
    superConductorTransitionTemperature: {
      name: 'superConductorTransitionTemperature',
      label: 'Super conductor transition temperature'
    },
    superconductorEnergyGap: {name: 'superconductorEnergyGap', label: 'superconductor energy gap'},
    surfaceCoefficientOfHeatTransfer: {
      name: 'surfaceCoefficientOfHeatTransfer',
      label: 'surface coefficient of heat transfer'
    },
    surfaceDensity: {name: 'surfaceDensity', label: 'surface density'},
    surfaceDensityOfCharge: {name: 'surfaceDensityOfCharge', label: 'surface density of charge'},
    surfaceTension: {name: 'surfaceTension', label: 'surface tension'},
    temperature: {name: 'temperature', label: 'temperature'},
    temperatureVariationOverTime: {name: 'temperatureVariationOverTime', label: 'temperature variation over time'},
    tension: {name: 'tension', label: 'tension'},
    thermalConductance: {name: 'thermalConductance', label: 'thermal conductance'},
    thermalConductivity: {name: 'thermalConductivity', label: 'thermal conductivity'},
    thermalDiffusionCoefficient: {name: 'thermalDiffusionCoefficient', label: 'thermal diffusion coefficient'},
    thermalDiffusionFactor: {name: 'thermalDiffusionFactor', label: 'thermal diffusion factor'},
    thermalDiffusionRatio: {name: 'thermalDiffusionRatio', label: 'thermal diffusion ratio'},
    thermalDiffusivity: {name: 'thermalDiffusivity', label: 'thermal diffusivity'},
    thermalInsulance: {name: 'thermalInsulance', label: 'thermal insulance'},
    thermalResistance: {name: 'thermalResistance', label: 'thermal resistance'},
    thermalUtilizationFactor: {name: 'thermalUtilizationFactor', label: 'thermal utilization factor'},
    thermodynamic: {name: 'thermodynamic', label: 'thermodynamic'},
    thermodynamicCriticalMagneticFluxDensity: {
      name: 'thermodynamicCriticalMagneticFluxDensity',
      label: 'thermodynamic critical magnetic flux density'
    },
    thermodynamicEnergy: {name: 'thermodynamicEnergy', label: 'thermodynamic energy'},
    thermoelectromotiveForceBetweenSubstancesAAndB: {
      name: 'thermoelectromotiveForceBetweenSubstancesAAndB',
      label: 'thermoelectromotive force between substances a and b'
    },
    thickness: {name: 'thickness', label: 'thickness'},
    thompsonCoefficient: {name: 'thompsonCoefficient', label: 'Thompson coefficient'},
    time: {name: 'time', label: 'time'},
    timeConstant: {name: 'timeConstant', label: 'time constant'},
    torque: {name: 'torque', label: 'torque'},
    torsionalStiffness: {name: 'torsionalStiffness', label: 'torsional stiffness'},
    totalAngularMomentumQuantumNumber: {
      name: 'totalAngularMomentumQuantumNumber',
      label: 'total angular momentum quantum number'
    },
    totalAtomicStoppingPower: {name: 'totalAtomicStoppingPower', label: 'total atomic stopping power'},
    totalCrossSection: {name: 'totalCrossSection', label: 'total cross-section'},
    totalIonizationByAParticle: {name: 'totalIonizationByAParticle', label: 'total ionization by a particle'},
    totalLinearStoppingPower: {name: 'totalLinearStoppingPower', label: 'total linear stopping power'},
    totalMassStoppingPower: {name: 'totalMassStoppingPower', label: 'total mass stopping power'},
    transmissionFactor: {name: 'transmissionFactor', label: 'transmission factor'},
    transmittance: {name: 'transmittance', label: 'transmittance'},
    transportNumberOfIonB: {name: 'transportNumberOfIonB', label: 'transport number of ion B'},
    unifiedAtomicMassConstant: {name: 'unifiedAtomicMassConstant', label: 'unified atomic mass constant'},
    upperCriticalMagneticFluxDensity: {
      name: 'upperCriticalMagneticFluxDensity',
      label: 'upper critical magnetic flux density'
    },
    velocity: {name: 'velocity', label: 'velocity'},
    velocityOfSoundPhaseVelocity: {name: 'velocityOfSoundPhaseVelocity', label: 'velocity of sound (phase velocity)'},
    velocitySpeedOnPropagationOfElectromagneticWavesInVacuo: {
      name: 'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
      label: 'velocity (speed) on propagation of electromagnetic waves in vacuo'
    },
    vergence: {name: 'vergence', label: 'vergence'},
    viscosityDynamicViscosity: {name: 'viscosityDynamicViscosity', label: 'viscosity (dynamic viscosity)'},
    voltage: {name: 'voltage', label: 'voltage'},
    volume: {name: 'volume', label: 'volume'},
    volumeDensityOfCharge: {name: 'volumeDensityOfCharge', label: 'volume density of charge'},
    volumeFlowRate: {name: 'volumeFlowRate', label: 'volume flow rate'},
    volumeOrBulkStrain: {name: 'volumeOrBulkStrain', label: 'volume or bulk strain'},
    volumePerTemperature: {name: 'volumePerTemperature', label: 'volume per temperature'},
    volumeRatio: {name: 'volumeRatio', label: 'volume ratio'},
    volumic: {name: 'volumic', label: 'volumic'},
    volumicAcceptorNumber: {name: 'volumicAcceptorNumber', label: 'volumic acceptor number'},
    volumicActivity: {name: 'volumicActivity', label: 'volumic activity'},
    volumicCharge: {name: 'volumicCharge', label: 'volumic charge'},
    volumicCrossSection: {name: 'volumicCrossSection', label: 'volumic cross-section'},
    volumicDonorNumber: {name: 'volumicDonorNumber', label: 'volumic donor number'},
    volumicDose: {name: 'volumicDose', label: 'volumic dose'},
    volumicElectromagneticEnergy: {name: 'volumicElectromagneticEnergy', label: 'volumic electromagnetic energy'},
    volumicElectronNumber: {name: 'volumicElectronNumber', label: 'volumic electron number'},
    volumicHoleNumber: {name: 'volumicHoleNumber', label: 'volumic hole number'},
    volumicIntrinsisNumber: {name: 'volumicIntrinsisNumber', label: 'volumic intrinsis number'},
    volumicMass: {name: 'volumicMass', label: 'volumic mass'},
    volumicNumberOfMoleculesOrParticles: {
      name: 'volumicNumberOfMoleculesOrParticles',
      label: 'volumic number of molecules (or particles)'
    },
    volumicTotalCrossSection: {name: 'volumicTotalCrossSection', label: 'volumic total cross-section'},
    waveNumber: {name: 'waveNumber', label: 'wave number'},
    wavelength: {name: 'wavelength', label: 'wavelength'},
    wavenumber: {name: 'wavenumber', label: 'wavenumber'},
    weberNumber: {name: 'weberNumber', label: 'Weber number'},
    weight: {name: 'weight', label: 'weight'},
    work: {name: 'work', label: 'work'},
    workFunction: {name: 'workFunction', label: 'work function'},
    workPerUnitWeight: {name: 'workPerUnitWeight', label: 'work per unit weight'}
  },

  units: {
    accessLine: {
      name: 'accessLine',
      label: 'access line',
      symbol: null,
      code: 'AL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    accountingUnit: {
      name: 'accountingUnit',
      label: 'accounting unit',
      symbol: null,
      code: 'E50',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    acre: {
      name: 'acre',
      label: 'acre',
      symbol: 'acre',
      code: 'ACR',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '4046.873 m²',
      quantityKinds: [
        'area',
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection'
      ]
    },
    acreFootBasedOnUsSurveyFoot: {
      name: 'acreFootBasedOnUsSurveyFoot',
      label: 'acre-foot (based on U.S. survey foot)',
      symbol: 'acre-ft (US survey)',
      code: 'M67',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.233489 × 10³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    activeUnit: {
      name: 'activeUnit',
      label: 'active unit',
      symbol: null,
      code: 'E25',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    actualPer360: {
      name: 'actualPer360',
      label: 'actual/360',
      symbol: 'y (360 days)',
      code: 'M37',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '3.1104000 × 10⁷ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    additionalMinute: {
      name: 'additionalMinute',
      label: 'additional minute',
      symbol: null,
      code: 'AH',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    airDryMetricTon: {
      name: 'airDryMetricTon',
      label: 'air dry metric ton',
      symbol: null,
      code: 'MD',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    airDryTon: {
      name: 'airDryTon',
      label: 'air dry ton',
      symbol: null,
      code: 'E28',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    alcoholicStrengthByMass: {
      name: 'alcoholicStrengthByMass',
      label: 'alcoholic strength by mass',
      symbol: null,
      code: 'ASM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    alcoholicStrengthByVolume: {
      name: 'alcoholicStrengthByVolume',
      label: 'alcoholic strength by volume',
      symbol: null,
      code: 'ASU',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    ampere: {
      name: 'ampere',
      label: 'ampere',
      symbol: 'A',
      code: 'AMP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticPotentialDifference', 'magnetomotiveForce', 'currentLinkage', 'electricCurrent']
    },
    ampereHour: {
      name: 'ampereHour',
      label: 'ampere hour',
      symbol: 'A·h',
      code: 'AMH',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '3.6 × 10³ C',
      quantityKinds: [
        'electricCharge',
        'electricFluxFluxOfDisplacement',
        'quantityOfElectricity',
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge'
      ]
    },
    ampereMinute: {
      name: 'ampereMinute',
      label: 'ampere minute',
      symbol: 'A·min',
      code: 'N95',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '60 C',
      quantityKinds: [
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'quantityOfElectricity'
      ]
    },
    amperePerCentimetre: {
      name: 'amperePerCentimetre',
      label: 'ampere per centimetre',
      symbol: 'A/cm',
      code: 'A2',
      referenceUnit: function () {
        return sammUDefinition.units['amperePerMetre'];
      },
      conversionFactor: '10² A/m',
      quantityKinds: [
        'linearElectricCurrentDensity',
        'magneticFieldStrength',
        'lineicElectricCurrent',
        'magneticFieldStrength',
        'magnetization',
        'linearElectricCurrentDensity',
        'lineicElectricCurrent'
      ]
    },
    amperePerKilogram: {
      name: 'amperePerKilogram',
      label: 'ampere per kilogram',
      symbol: 'A/kg',
      code: 'H31',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['currentDensity']
    },
    amperePerMetre: {
      name: 'amperePerMetre',
      label: 'ampere per metre',
      symbol: 'A/m',
      code: 'AE',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticFieldStrength', 'magnetization', 'linearElectricCurrentDensity', 'lineicElectricCurrent']
    },
    amperePerMillimetre: {
      name: 'amperePerMillimetre',
      label: 'ampere per millimetre',
      symbol: 'A/mm',
      code: 'A3',
      referenceUnit: function () {
        return sammUDefinition.units['amperePerMetre'];
      },
      conversionFactor: '10³ A/m',
      quantityKinds: [
        'magneticFieldStrength',
        'lineicElectricCurrent',
        'linearElectricCurrentDensity',
        'magneticFieldStrength',
        'magnetization',
        'linearElectricCurrentDensity',
        'lineicElectricCurrent'
      ]
    },
    amperePerPascal: {
      name: 'amperePerPascal',
      label: 'ampere per pascal',
      symbol: 'A/Pa',
      code: 'N93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['currentDensity']
    },
    amperePerSquareCentimetre: {
      name: 'amperePerSquareCentimetre',
      label: 'ampere per square centimetre',
      symbol: 'A/cm²',
      code: 'A4',
      referenceUnit: function () {
        return sammUDefinition.units['amperePerSquareMetre'];
      },
      conversionFactor: '10⁴ A/m²',
      quantityKinds: ['currentDensity', 'currentDensity']
    },
    amperePerSquareMetre: {
      name: 'amperePerSquareMetre',
      label: 'ampere per square metre',
      symbol: 'A/m²',
      code: 'A41',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['currentDensity']
    },
    amperePerSquareMetreKelvinSquared: {
      name: 'amperePerSquareMetreKelvinSquared',
      label: 'ampere per square metre kelvin squared',
      symbol: 'A/(m²·K²)',
      code: 'A6',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['richardsonConstant']
    },
    amperePerSquareMillimetre: {
      name: 'amperePerSquareMillimetre',
      label: 'ampere per square millimetre',
      symbol: 'A/mm²',
      code: 'A7',
      referenceUnit: function () {
        return sammUDefinition.units['amperePerSquareMetre'];
      },
      conversionFactor: '10⁶ A/m²',
      quantityKinds: ['currentDensity', 'currentDensity']
    },
    ampereSecond: {
      name: 'ampereSecond',
      label: 'ampere second',
      symbol: 'A·s',
      code: 'A8',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: 'C',
      quantityKinds: [
        'quantityOfElectricity',
        'electricCharge',
        'electricFluxFluxOfDisplacement',
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge'
      ]
    },
    ampereSquareMetre: {
      name: 'ampereSquareMetre',
      label: 'ampere square metre',
      symbol: 'A·m²',
      code: 'A5',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'magneticMomentOfParticle',
        'electromagneticMoment',
        'magneticAreaMoment',
        'magneticMoment',
        'bohrMagneton',
        'nuclearMagnetonOrnucleus'
      ]
    },
    ampereSquareMetrePerJouleSecond: {
      name: 'ampereSquareMetrePerJouleSecond',
      label: 'ampere square metre per joule second',
      symbol: 'A·m²/(J·s)',
      code: 'A10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['gyromagneticRatio', 'gyromagneticCoefficient']
    },
    ampereSquaredSecond: {
      name: 'ampereSquaredSecond',
      label: 'ampere squared second',
      symbol: 'A²·s',
      code: 'H32',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['quantityOfElectricity', 'electricFluxFluxOfDisplacement', 'electricCharge']
    },
    angstrom: {
      name: 'angstrom',
      label: 'angstrom',
      symbol: 'Å',
      code: 'A11',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁻¹⁰ m',
      quantityKinds: [
        'cartesianCoordinates',
        'radius',
        'distance',
        'breadth',
        'length',
        'latticePlaneSpacing',
        'bohrRadius',
        'burgersVector',
        'diameter',
        'thickness',
        'radiusOfCurvature',
        'height',
        'lengthOfPath',
        'wavelength',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    antiHemophilicFactorAhfUnit: {
      name: 'antiHemophilicFactorAhfUnit',
      label: 'anti-hemophilic factor (AHF) unit',
      symbol: null,
      code: 'AQ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    assembly: {
      name: 'assembly',
      label: 'assembly',
      symbol: null,
      code: 'AY',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    assortment: {
      name: 'assortment',
      label: 'assortment',
      symbol: null,
      code: 'AS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    astronomicalUnit: {
      name: 'astronomicalUnit',
      label: 'astronomical unit',
      symbol: 'ua',
      code: 'A12',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '1.49597870 × 10¹¹ m',
      quantityKinds: [
        'thickness',
        'lengthOfPath',
        'length',
        'distance',
        'radius',
        'radiusOfCurvature',
        'breadth',
        'height',
        'diameter',
        'cartesianCoordinates',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    attofarad: {
      name: 'attofarad',
      label: 'attofarad',
      symbol: 'aF',
      code: 'H48',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['capacitance']
    },
    attojoule: {
      name: 'attojoule',
      label: 'attojoule',
      symbol: 'aJ',
      code: 'A13',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10⁻¹⁸ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'acceptorIonizationEnergy',
        'electronAffinity',
        'kineticEnergy',
        'work',
        'superconductorEnergyGap',
        'donorIonizationEnergy',
        'energy',
        'potentialEnergy',
        'exchangeIntergral'
      ]
    },
    averageMinutePerCall: {
      name: 'averageMinutePerCall',
      label: 'average minute per call',
      symbol: null,
      code: 'AI',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    ball: {
      name: 'ball',
      label: 'ball',
      symbol: null,
      code: 'AA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    barCubicMetrePerSecond: {
      name: 'barCubicMetrePerSecond',
      label: 'bar cubic metre per second',
      symbol: 'bar·m³/s',
      code: 'F92',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['leakageRateOfGas']
    },
    barLitrePerSecond: {
      name: 'barLitrePerSecond',
      label: 'bar litre per second',
      symbol: 'bar·l/s',
      code: 'F91',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['leakageRateOfGas']
    },
    barPerBar: {
      name: 'barPerBar',
      label: 'bar per bar',
      symbol: 'bar/bar',
      code: 'J56',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureRatio']
    },
    barPerKelvin: {
      name: 'barPerKelvin',
      label: 'bar per kelvin',
      symbol: 'bar/K',
      code: 'F81',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureCoefficient']
    },
    barUnitOfPressure: {
      name: 'barUnitOfPressure',
      label: 'bar [unit of pressure]',
      symbol: 'bar',
      code: 'BAR',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁵ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfCompression',
        'staticPressure',
        'shearStress',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'pressure',
        'bulkModulus',
        'normalStress',
        'modulusOfRigidity',
        'shearModulus'
      ]
    },
    barn: {
      name: 'barn',
      label: 'barn',
      symbol: 'b',
      code: 'A14',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10⁻²⁸ m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'totalCrossSection'
      ]
    },
    barnPerElectronvolt: {
      name: 'barnPerElectronvolt',
      label: 'barn per electronvolt',
      symbol: 'b/eV',
      code: 'A15',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerJoule'];
      },
      conversionFactor: '6.241 51 × 10⁻¹⁰ m²/J',
      quantityKinds: ['spectralCrossSection', 'spectralCrossSection']
    },
    barnPerSteradian: {
      name: 'barnPerSteradian',
      label: 'barn per steradian',
      symbol: 'b/sr',
      code: 'A17',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerSteradian'];
      },
      conversionFactor: '1 × 10⁻²⁸ m²/sr',
      quantityKinds: ['angularCrossSection', 'angularCrossSection']
    },
    barnPerSteradianElectronvolt: {
      name: 'barnPerSteradianElectronvolt',
      label: 'barn per steradian electronvolt',
      symbol: 'b/(sr·eV)',
      code: 'A16',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['spectralAngularCrossSection']
    },
    barrelImperial: {
      name: 'barrelImperial',
      label: 'barrel, imperial',
      symbol: null,
      code: 'B4',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    barrelUkPetroleum: {
      name: 'barrelUkPetroleum',
      label: 'barrel (UK petroleum)',
      symbol: 'bbl (UK liq.)',
      code: 'J57',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '0.15911315 m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    barrelUkPetroleumPerDay: {
      name: 'barrelUkPetroleumPerDay',
      label: 'barrel (UK petroleum) per day',
      symbol: 'bbl (UK liq.)/d',
      code: 'J59',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.8415874 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    barrelUkPetroleumPerHour: {
      name: 'barrelUkPetroleumPerHour',
      label: 'barrel (UK petroleum) per hour',
      symbol: 'bbl (UK liq.)/h',
      code: 'J60',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.419810 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    barrelUkPetroleumPerMinute: {
      name: 'barrelUkPetroleumPerMinute',
      label: 'barrel (UK petroleum) per minute',
      symbol: 'bbl (UK liq.)/min',
      code: 'J58',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.651886 m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    barrelUkPetroleumPerSecond: {
      name: 'barrelUkPetroleumPerSecond',
      label: 'barrel (UK petroleum) per second',
      symbol: 'bbl (UK liq.)/s',
      code: 'J61',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '0.15911315 m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    barrelUs: {
      name: 'barrelUs',
      label: 'barrel (US)',
      symbol: 'barrel (US)',
      code: 'BLL',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '158.9873 × 10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    barrelUsPerDay: {
      name: 'barrelUsPerDay',
      label: 'barrel (US) per day',
      symbol: 'barrel (US)/d',
      code: 'B1',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.84013 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    barrelUsPerMinute: {
      name: 'barrelUsPerMinute',
      label: 'barrel (US) per minute',
      symbol: 'barrel (US)/min',
      code: '5A',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.64979 × 10⁻³ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    barrelUsPetroleumPerHour: {
      name: 'barrelUsPetroleumPerHour',
      label: 'barrel (US petroleum) per hour',
      symbol: 'bbl (US)/h',
      code: 'J62',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.416314 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    barrelUsPetroleumPerSecond: {
      name: 'barrelUsPetroleumPerSecond',
      label: 'barrel (US petroleum) per second',
      symbol: 'bbl (US)/s',
      code: 'J63',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '0.1589873 m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    baseBox: {
      name: 'baseBox',
      label: 'base box',
      symbol: null,
      code: 'BB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    batch: {
      name: 'batch',
      label: 'batch',
      symbol: null,
      code: '5B',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    battingPound: {
      name: 'battingPound',
      label: 'batting pound',
      symbol: null,
      code: 'B3',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    baud: {
      name: 'baud',
      label: 'baud',
      symbol: 'Bd',
      code: 'J38',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    beaufort: {
      name: 'beaufort',
      label: 'Beaufort',
      symbol: 'Bft',
      code: 'M19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    becquerel: {
      name: 'becquerel',
      label: 'becquerel',
      symbol: 'Bq',
      code: 'BQL',
      referenceUnit: function () {
        return sammUDefinition.units['curie'];
      },
      conversionFactor: '27.027 × 10⁻¹² Ci',
      quantityKinds: ['activity', 'activity']
    },
    becquerelPerCubicMetre: {
      name: 'becquerelPerCubicMetre',
      label: 'becquerel per cubic metre',
      symbol: 'Bq/m³',
      code: 'A19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicActivity', 'activityConcentration']
    },
    becquerelPerKilogram: {
      name: 'becquerelPerKilogram',
      label: 'becquerel per kilogram',
      symbol: 'Bq/kg',
      code: 'A18',
      referenceUnit: function () {
        return sammUDefinition.units['curiePerKilogram'];
      },
      conversionFactor: '27.027 × 10⁻¹² Ci/kg',
      quantityKinds: ['specificActivityInASample', 'specificActivityInASample']
    },
    bel: {
      name: 'bel',
      label: 'bel',
      symbol: 'B',
      code: 'M72',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['levelOfAPowerQuantity', 'levelOfAFieldQuantity']
    },
    belPerMetre: {
      name: 'belPerMetre',
      label: 'bel per metre',
      symbol: 'B/m',
      code: 'P43',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['soundPressureLevel', 'soundPowerLevel']
    },
    bigPoint: {
      name: 'bigPoint',
      label: 'big point',
      symbol: 'bp',
      code: 'H82',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '0.3527778 × 10⁻³ m',
      quantityKinds: [
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    billionEur: {
      name: 'billionEur',
      label: 'billion (EUR)',
      symbol: null,
      code: 'BIL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    biot: {
      name: 'biot',
      label: 'biot',
      symbol: 'Bi',
      code: 'N96',
      referenceUnit: function () {
        return sammUDefinition.units['ampere'];
      },
      conversionFactor: '10¹ A',
      quantityKinds: [
        'magneticPotentialDifference',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent',
        'magneticPotentialDifference'
      ]
    },
    bit: {
      name: 'bit',
      label: 'bit',
      symbol: 'b',
      code: 'A99',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['informationEntropy']
    },
    bitPerCubicMetre: {
      name: 'bitPerCubicMetre',
      label: 'bit per cubic metre',
      symbol: 'bit/m³',
      code: 'F01',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    bitPerMetre: {
      name: 'bitPerMetre',
      label: 'bit per metre',
      symbol: 'bit/m',
      code: 'E88',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    bitPerSecond: {
      name: 'bitPerSecond',
      label: 'bit per second',
      symbol: 'bit/s',
      code: 'B10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    bitPerSquareMetre: {
      name: 'bitPerSquareMetre',
      label: 'bit per square metre',
      symbol: 'bit/m²',
      code: 'E89',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    blank: {
      name: 'blank',
      label: 'blank',
      symbol: null,
      code: 'H21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    boardFoot: {
      name: 'boardFoot',
      label: 'board foot',
      symbol: 'fbm',
      code: 'BFT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    book: {
      name: 'book',
      label: 'book',
      symbol: null,
      code: 'D63',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    brakeHorsePower: {
      name: 'brakeHorsePower',
      label: 'brake horse power',
      symbol: 'BHP',
      code: 'BHP',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '7.457 × 10² W',
      quantityKinds: [
        'power',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    britishThermalUnit39Degreesf: {
      name: 'britishThermalUnit39Degreesf',
      label: 'British thermal unit (39 °F)',
      symbol: 'Btu (39 °F)',
      code: 'N66',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.05967 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'helmholtzFreeEnergy',
        'quantityOfHeat',
        'thermodynamicEnergy',
        'enthalpy',
        'helmholtzFunction',
        'heat',
        'energy'
      ]
    },
    britishThermalUnit59Degreesf: {
      name: 'britishThermalUnit59Degreesf',
      label: 'British thermal unit (59 °F)',
      symbol: 'Btu (59 °F)',
      code: 'N67',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.05480 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'quantityOfHeat',
        'energy',
        'helmholtzFunction',
        'enthalpy',
        'heat',
        'thermodynamicEnergy',
        'helmholtzFreeEnergy'
      ]
    },
    britishThermalUnit60Degreesf: {
      name: 'britishThermalUnit60Degreesf',
      label: 'British thermal unit (60 °F)',
      symbol: 'Btu (60 °F)',
      code: 'N68',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.05468 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'quantityOfHeat',
        'energy',
        'heat',
        'helmholtzFunction',
        'enthalpy',
        'thermodynamicEnergy',
        'helmholtzFreeEnergy'
      ]
    },
    britishThermalUnitInternationalTable: {
      name: 'britishThermalUnitInternationalTable',
      label: 'British thermal unit (international table)',
      symbol: 'BtuIT',
      code: 'BTU',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.055056 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'energy',
        'quantityOfHeat',
        'enthalpy',
        'thermodynamicEnergy',
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'heat'
      ]
    },
    britishThermalUnitInternationalTableFootPerHourSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitInternationalTableFootPerHourSquareFootDegreeFahrenheit',
      label: 'British thermal unit (international table) foot per hour square foot degree Fahrenheit',
      symbol: 'BtuIT·ft/(h·ft²·°F)',
      code: 'J40',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '1.730735 W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    britishThermalUnitInternationalTableInchPerHourSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitInternationalTableInchPerHourSquareFootDegreeFahrenheit',
      label: 'British thermal unit (international table) inch per hour square foot degree Fahrenheit',
      symbol: 'BtuIT·in/(h·ft²·°F)',
      code: 'J41',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '0.1442279 W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    britishThermalUnitInternationalTableInchPerSecondSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitInternationalTableInchPerSecondSquareFootDegreeFahrenheit',
      label: 'British thermal unit (international table) inch per second square foot degree Fahrenheit',
      symbol: 'BtuIT·in/(s·ft²·°F)',
      code: 'J42',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '5.192204 × 10² W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    britishThermalUnitInternationalTablePerCubicFoot: {
      name: 'britishThermalUnitInternationalTablePerCubicFoot',
      label: 'British thermal unit (international table) per cubic foot',
      symbol: 'BtuIT/ft³',
      code: 'N58',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerCubicMetre'];
      },
      conversionFactor: '3.725895 ×10⁴ J/m³',
      quantityKinds: [
        'electromagneticEnergyDensity',
        'volumicElectromagneticEnergy',
        'soundEnergy',
        'soundEnergyDensity',
        'volumic',
        'radiantEnergyDensity',
        'energyDensity'
      ]
    },
    britishThermalUnitInternationalTablePerDegreeFahrenheit: {
      name: 'britishThermalUnitInternationalTablePerDegreeFahrenheit',
      label: 'British thermal unit (international table) per degree Fahrenheit',
      symbol: 'BtuIT/°F',
      code: 'N60',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKelvin'];
      },
      conversionFactor: '1.899101 × 10³ J/K',
      quantityKinds: ['heatCapacity', 'entropy', 'boltzmannConstant', 'entropy', 'massieuFunction', 'heatCapacity', 'planckFunction']
    },
    britishThermalUnitInternationalTablePerDegreeRankine: {
      name: 'britishThermalUnitInternationalTablePerDegreeRankine',
      label: 'British thermal unit (international table) per degree Rankine',
      symbol: 'BtuIT/°R',
      code: 'N62',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKelvin'];
      },
      conversionFactor: '1.899101 × 10³ J/K',
      quantityKinds: ['heatCapacity', 'entropy', 'boltzmannConstant', 'entropy', 'massieuFunction', 'heatCapacity', 'planckFunction']
    },
    britishThermalUnitInternationalTablePerHour: {
      name: 'britishThermalUnitInternationalTablePerHour',
      label: 'British thermal unit (international table) per hour',
      symbol: 'BtuIT/h',
      code: '2I',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '2.930711× 10⁻¹ W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    britishThermalUnitInternationalTablePerHourSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitInternationalTablePerHourSquareFootDegreeFahrenheit',
      label: 'British thermal unit (international table) per hour square foot degree Fahrenheit',
      symbol: 'BtuIT/(h·ft²·°F)',
      code: 'N74',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetreKelvin'];
      },
      conversionFactor: '5.678263 W/(m² × K)',
      quantityKinds: ['coefficientOfHeatTransfer', 'surfaceCoefficientOfHeatTransfer']
    },
    britishThermalUnitInternationalTablePerHourSquareFootDegreeRankine: {
      name: 'britishThermalUnitInternationalTablePerHourSquareFootDegreeRankine',
      label: 'British thermal unit (international table) per hour square foot degree Rankine',
      symbol: 'BtuIT/(h·ft²·°R)',
      code: 'A23',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['surfaceCoefficientOfHeatTransfer']
    },
    britishThermalUnitInternationalTablePerMinute: {
      name: 'britishThermalUnitInternationalTablePerMinute',
      label: 'British thermal unit (international table) per minute',
      symbol: 'BtuIT/min',
      code: 'J44',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '17.584266 W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    britishThermalUnitInternationalTablePerPound: {
      name: 'britishThermalUnitInternationalTablePerPound',
      label: 'British thermal unit (international table) per pound',
      symbol: 'BtuIT/lb',
      code: 'AZ',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogram'];
      },
      conversionFactor: '2326 J/kg',
      quantityKinds: ['specificEnergy', 'massicEnergy', 'massicHelmholtzFreeEnergy']
    },
    britishThermalUnitInternationalTablePerPoundDegreeFahrenheit: {
      name: 'britishThermalUnitInternationalTablePerPoundDegreeFahrenheit',
      label: 'British thermal unit (international table) per pound degree Fahrenheit',
      symbol: 'BtuIT/(lb·°F)',
      code: 'J43',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogramKelvin'];
      },
      conversionFactor: '4.1868 × 10³ J/(kg × K)',
      quantityKinds: [
        'heatCapacity',
        'entropy',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtConstantPressure'
      ]
    },
    britishThermalUnitInternationalTablePerPoundDegreeRankine: {
      name: 'britishThermalUnitInternationalTablePerPoundDegreeRankine',
      label: 'British thermal unit (international table) per pound degree Rankine',
      symbol: 'BtuIT/(lb·°R)',
      code: 'A21',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogramKelvin'];
      },
      conversionFactor: '4186.8 J/(kg × K)',
      quantityKinds: [
        'specificHeatCapacityAtConstantPressure',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtConstantPressure'
      ]
    },
    britishThermalUnitInternationalTablePerSecond: {
      name: 'britishThermalUnitInternationalTablePerSecond',
      label: 'British thermal unit (international table) per second',
      symbol: 'BtuIT/s',
      code: 'J45',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '1.055056 × 10³ W',
      quantityKinds: [
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower',
        'heatFlowRate'
      ]
    },
    britishThermalUnitInternationalTablePerSecondFootDegreeRankine: {
      name: 'britishThermalUnitInternationalTablePerSecondFootDegreeRankine',
      label: 'British thermal unit (international table) per second foot degree Rankine',
      symbol: 'BtuIT/(s·ft·°R)',
      code: 'A22',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '6230.64 W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    britishThermalUnitInternationalTablePerSecondSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitInternationalTablePerSecondSquareFootDegreeFahrenheit',
      label: 'British thermal unit (international table) per second square foot degree Fahrenheit',
      symbol: 'BtuIT/(s·ft²·°F)',
      code: 'N76',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetreKelvin'];
      },
      conversionFactor: '2.044175 × 10⁴ W/(m² × K)',
      quantityKinds: ['coefficientOfHeatTransfer', 'surfaceCoefficientOfHeatTransfer']
    },
    britishThermalUnitInternationalTablePerSecondSquareFootDegreeRankine: {
      name: 'britishThermalUnitInternationalTablePerSecondSquareFootDegreeRankine',
      label: 'British thermal unit (international table) per second square foot degree Rankine',
      symbol: 'BtuIT/(s·ft²·°R)',
      code: 'A20',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetreKelvin'];
      },
      conversionFactor: '20441.7 W/(m² × K)',
      quantityKinds: ['coefficientOfHeatTransfer', 'surfaceCoefficientOfHeatTransfer']
    },
    britishThermalUnitInternationalTablePerSquareFoot: {
      name: 'britishThermalUnitInternationalTablePerSquareFoot',
      label: 'British thermal unit (international table) per square foot',
      symbol: 'BtuIT/ft²',
      code: 'P37',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerSquareMetre'];
      },
      conversionFactor: '1.135653 × 10⁴ J/m²',
      quantityKinds: ['radianceExposure', 'radiantEnergyFluence', 'radiantEnergyFluence', 'radianceExposure', 'energyFluence']
    },
    britishThermalUnitInternationalTablePerSquareFootHour: {
      name: 'britishThermalUnitInternationalTablePerSquareFootHour',
      label: 'British thermal unit (international table) per square foot hour',
      symbol: 'BtuIT/(ft²·h)',
      code: 'N50',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '3.154591 W/m²',
      quantityKinds: [
        'densityOfHeatFlowRate',
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance'
      ]
    },
    britishThermalUnitInternationalTablePerSquareFootSecond: {
      name: 'britishThermalUnitInternationalTablePerSquareFootSecond',
      label: 'British thermal unit (international table) per square foot second',
      symbol: 'BtuIT/(ft²·s)',
      code: 'N53',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '1.135653 × 10⁴ W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'densityOfHeatFlowRate'
      ]
    },
    britishThermalUnitInternationalTablePerSquareInchSecond: {
      name: 'britishThermalUnitInternationalTablePerSquareInchSecond',
      label: 'British thermal unit (international table) per square inch second',
      symbol: 'BtuIT/(in²·s)',
      code: 'N55',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '1.634246 × 10⁶ W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'densityOfHeatFlowRate'
      ]
    },
    britishThermalUnitMean: {
      name: 'britishThermalUnitMean',
      label: 'British thermal unit (mean)',
      symbol: 'Btu',
      code: 'J39',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.05587 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'heat',
        'helmholtzFreeEnergy',
        'enthalpy',
        'helmholtzFunction',
        'quantityOfHeat',
        'energy',
        'thermodynamicEnergy'
      ]
    },
    britishThermalUnitThermochemicalFootPerHourSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitThermochemicalFootPerHourSquareFootDegreeFahrenheit',
      label: 'British thermal unit (thermochemical) foot per hour square foot degree Fahrenheit',
      symbol: 'Btuth·ft/(h·ft²·°F)',
      code: 'J46',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '1.729577 W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    britishThermalUnitThermochemicalInchPerHourSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitThermochemicalInchPerHourSquareFootDegreeFahrenheit',
      label: 'British thermal unit (thermochemical) inch per hour square foot degree Fahrenheit',
      symbol: 'Btuth·in/(h·ft²·°F)',
      code: 'J48',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '0.1441314 W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    britishThermalUnitThermochemicalInchPerSecondSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitThermochemicalInchPerSecondSquareFootDegreeFahrenheit',
      label: 'British thermal unit (thermochemical) inch per second square foot degree Fahrenheit',
      symbol: 'Btuth·in/(s·ft²·°F)',
      code: 'J49',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '5.188732 × 10² W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    britishThermalUnitThermochemicalPerCubicFoot: {
      name: 'britishThermalUnitThermochemicalPerCubicFoot',
      label: 'British thermal unit (thermochemical) per cubic foot',
      symbol: 'Btuth/ft³',
      code: 'N59',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerCubicMetre'];
      },
      conversionFactor: '3.723403 ×10⁴ J/m³',
      quantityKinds: [
        'energyDensity',
        'electromagneticEnergyDensity',
        'volumicElectromagneticEnergy',
        'soundEnergy',
        'soundEnergyDensity',
        'volumic',
        'radiantEnergyDensity'
      ]
    },
    britishThermalUnitThermochemicalPerDegreeFahrenheit: {
      name: 'britishThermalUnitThermochemicalPerDegreeFahrenheit',
      label: 'British thermal unit (thermochemical) per degree Fahrenheit',
      symbol: 'Btuth/°F',
      code: 'N61',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKelvin'];
      },
      conversionFactor: '1.897830 × 10³ J/K',
      quantityKinds: ['boltzmannConstant', 'entropy', 'massieuFunction', 'heatCapacity', 'planckFunction', 'heatCapacity', 'entropy']
    },
    britishThermalUnitThermochemicalPerDegreeRankine: {
      name: 'britishThermalUnitThermochemicalPerDegreeRankine',
      label: 'British thermal unit (thermochemical) per degree Rankine',
      symbol: 'Btuth/°R',
      code: 'N63',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKelvin'];
      },
      conversionFactor: '1.897830 × 10³ J/K',
      quantityKinds: ['heatCapacity', 'entropy', 'boltzmannConstant', 'entropy', 'massieuFunction', 'heatCapacity', 'planckFunction']
    },
    britishThermalUnitThermochemicalPerHour: {
      name: 'britishThermalUnitThermochemicalPerHour',
      label: 'British thermal unit (thermochemical) per hour',
      symbol: 'Btuth/h',
      code: 'J47',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '0.2928751 W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    britishThermalUnitThermochemicalPerHourSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitThermochemicalPerHourSquareFootDegreeFahrenheit',
      label: 'British thermal unit (thermochemical) per hour square foot degree Fahrenheit',
      symbol: 'Btuth/(h·ft²·°F)',
      code: 'N75',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetreKelvin'];
      },
      conversionFactor: '5.674466 W/(m² × K)',
      quantityKinds: ['surfaceCoefficientOfHeatTransfer', 'coefficientOfHeatTransfer']
    },
    britishThermalUnitThermochemicalPerMinute: {
      name: 'britishThermalUnitThermochemicalPerMinute',
      label: 'British thermal unit (thermochemical) per minute',
      symbol: 'Btuth/min',
      code: 'J51',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '17.57250 W',
      quantityKinds: [
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower',
        'heatFlowRate'
      ]
    },
    britishThermalUnitThermochemicalPerPound: {
      name: 'britishThermalUnitThermochemicalPerPound',
      label: 'British thermal unit (thermochemical) per pound',
      symbol: 'Btuth/lb',
      code: 'N73',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogram'];
      },
      conversionFactor: '2.324444 × 10³ J/kg',
      quantityKinds: ['specificEnergy', 'massicEnergy', 'massicHelmholtzFreeEnergy']
    },
    britishThermalUnitThermochemicalPerPoundDegreeFahrenheit: {
      name: 'britishThermalUnitThermochemicalPerPoundDegreeFahrenheit',
      label: 'British thermal unit (thermochemical) per pound degree Fahrenheit',
      symbol: 'Btuth/(lb·°F)',
      code: 'J50',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogramKelvin'];
      },
      conversionFactor: '4.184 × 10³ J/(kg × K)',
      quantityKinds: [
        'entropy',
        'heatCapacity',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtConstantPressure'
      ]
    },
    britishThermalUnitThermochemicalPerPoundDegreeRankine: {
      name: 'britishThermalUnitThermochemicalPerPoundDegreeRankine',
      label: 'British thermal unit (thermochemical) per pound degree Rankine',
      symbol: '(Btuth/°R)/lb',
      code: 'N64',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogramKelvin'];
      },
      conversionFactor: '4.184 × 10³ J/(kg × K)',
      quantityKinds: [
        'entropy',
        'heatCapacity',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtConstantPressure'
      ]
    },
    britishThermalUnitThermochemicalPerSecond: {
      name: 'britishThermalUnitThermochemicalPerSecond',
      label: 'British thermal unit (thermochemical) per second',
      symbol: 'Btuth/s',
      code: 'J52',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '1.054350 × 10³ W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    britishThermalUnitThermochemicalPerSecondSquareFootDegreeFahrenheit: {
      name: 'britishThermalUnitThermochemicalPerSecondSquareFootDegreeFahrenheit',
      label: 'British thermal unit (thermochemical) per second square foot degree Fahrenheit',
      symbol: 'Btuth/(s·ft²·°F)',
      code: 'N77',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetreKelvin'];
      },
      conversionFactor: '2.042808 × 10⁴ W/(m² × K)',
      quantityKinds: ['coefficientOfHeatTransfer', 'surfaceCoefficientOfHeatTransfer']
    },
    britishThermalUnitThermochemicalPerSquareFoot: {
      name: 'britishThermalUnitThermochemicalPerSquareFoot',
      label: 'British thermal unit (thermochemical) per square foot',
      symbol: 'Btuth/ft²',
      code: 'P38',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerSquareMetre'];
      },
      conversionFactor: '1.134893 × 10⁴ J/m²',
      quantityKinds: ['radianceExposure', 'radiantEnergyFluence', 'radiantEnergyFluence', 'radianceExposure', 'energyFluence']
    },
    britishThermalUnitThermochemicalPerSquareFootHour: {
      name: 'britishThermalUnitThermochemicalPerSquareFootHour',
      label: 'British thermal unit (thermochemical) per square foot hour',
      symbol: 'Btuth/(ft²·h)',
      code: 'N51',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '3.152481 W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'densityOfHeatFlowRate'
      ]
    },
    britishThermalUnitThermochemicalPerSquareFootMinute: {
      name: 'britishThermalUnitThermochemicalPerSquareFootMinute',
      label: 'British thermal unit (thermochemical) per square foot minute',
      symbol: 'Btuth/(ft²·min)',
      code: 'N52',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '1.891489 × 10² W/m²',
      quantityKinds: [
        'densityOfHeatFlowRate',
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance'
      ]
    },
    britishThermalUnitThermochemicalPerSquareFootSecond: {
      name: 'britishThermalUnitThermochemicalPerSquareFootSecond',
      label: 'British thermal unit (thermochemical) per square foot second',
      symbol: 'Btuth/(ft²·s)',
      code: 'N54',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '1.134893 × 10⁴ W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'densityOfHeatFlowRate'
      ]
    },
    bulkPack: {
      name: 'bulkPack',
      label: 'bulk pack',
      symbol: 'pk',
      code: 'AB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    bushelUk: {
      name: 'bushelUk',
      label: 'bushel (UK)',
      symbol: 'bushel (UK)',
      code: 'BUI',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '3.636872 × 10⁻² m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    bushelUkPerDay: {
      name: 'bushelUkPerDay',
      label: 'bushel (UK) per day',
      symbol: 'bu (UK)/d',
      code: 'J64',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.209343 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    bushelUkPerHour: {
      name: 'bushelUkPerHour',
      label: 'bushel (UK) per hour',
      symbol: 'bu (UK)/h',
      code: 'J65',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.010242 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    bushelUkPerMinute: {
      name: 'bushelUkPerMinute',
      label: 'bushel (UK) per minute',
      symbol: 'bu (UK)/min',
      code: 'J66',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '6.061453 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    bushelUkPerSecond: {
      name: 'bushelUkPerSecond',
      label: 'bushel (UK) per second',
      symbol: 'bu (UK)/s',
      code: 'J67',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.636872 × 10⁻² m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    bushelUs: {
      name: 'bushelUs',
      label: 'bushel (US)',
      symbol: 'bu (US)',
      code: 'BUA',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '3.523907 × 10⁻² m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    bushelUsDryPerDay: {
      name: 'bushelUsDryPerDay',
      label: 'bushel (US dry) per day',
      symbol: 'bu (US dry)/d',
      code: 'J68',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.078596 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    bushelUsDryPerHour: {
      name: 'bushelUsDryPerHour',
      label: 'bushel (US dry) per hour',
      symbol: 'bu (US dry)/h',
      code: 'J69',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '9.788631 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    bushelUsDryPerMinute: {
      name: 'bushelUsDryPerMinute',
      label: 'bushel (US dry) per minute',
      symbol: 'bu (US dry)/min',
      code: 'J70',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '5.873178 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    bushelUsDryPerSecond: {
      name: 'bushelUsDryPerSecond',
      label: 'bushel (US dry) per second',
      symbol: 'bu (US dry)/s',
      code: 'J71',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.523907 × 10⁻² m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    byte: {
      name: 'byte',
      label: 'byte',
      symbol: 'B',
      code: 'AD',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['informationEntropy']
    },
    bytePerSecond: {
      name: 'bytePerSecond',
      label: 'byte per second',
      symbol: 'byte/s',
      code: 'P93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    cake: {
      name: 'cake',
      label: 'cake',
      symbol: null,
      code: 'KA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    call: {
      name: 'call',
      label: 'call',
      symbol: null,
      code: 'C0',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    calorie20Degreesc: {
      name: 'calorie20Degreesc',
      label: 'calorie (20 °C)',
      symbol: 'cal₂₀',
      code: 'N69',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '4.18190',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'helmholtzFreeEnergy',
        'thermodynamicEnergy',
        'enthalpy',
        'quantityOfHeat',
        'helmholtzFunction',
        'heat',
        'energy'
      ]
    },
    calorieInternationalTablePerGramDegreeCelsius: {
      name: 'calorieInternationalTablePerGramDegreeCelsius',
      label: 'calorie (international table) per gram degree Celsius',
      symbol: 'calIT/(g·°C)',
      code: 'J76',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogramKelvin'];
      },
      conversionFactor: '4.1868 × 10³ J/(kg × K)',
      quantityKinds: [
        'heatCapacity',
        'entropy',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtConstantPressure'
      ]
    },
    calorieMean: {
      name: 'calorieMean',
      label: 'calorie (mean)',
      symbol: 'cal',
      code: 'J75',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '4.19002 J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'helmholtzFunction',
        'quantityOfHeat',
        'heat',
        'energy',
        'thermodynamicEnergy',
        'enthalpy',
        'helmholtzFreeEnergy'
      ]
    },
    calorieThermochemicalPerCentimetreSecondDegreeCelsius: {
      name: 'calorieThermochemicalPerCentimetreSecondDegreeCelsius',
      label: 'calorie (thermochemical) per centimetre second degree Celsius',
      symbol: 'calth/(cm·s·°C)',
      code: 'J78',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '4.184 × 10² W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    calorieThermochemicalPerGramDegreeCelsius: {
      name: 'calorieThermochemicalPerGramDegreeCelsius',
      label: 'calorie (thermochemical) per gram degree Celsius',
      symbol: 'calth/(g·°C)',
      code: 'J79',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogramKelvin'];
      },
      conversionFactor: '4.184 × 10³ J/(kg × K)',
      quantityKinds: [
        'entropy',
        'heatCapacity',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtConstantPressure'
      ]
    },
    calorieThermochemicalPerMinute: {
      name: 'calorieThermochemicalPerMinute',
      label: 'calorie (thermochemical) per minute',
      symbol: 'calth/min',
      code: 'J81',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '6.973333 × 10⁻² W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    calorieThermochemicalPerSecond: {
      name: 'calorieThermochemicalPerSecond',
      label: 'calorie (thermochemical) per second',
      symbol: 'calth/s',
      code: 'J82',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '4.184 W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    calorieThermochemicalPerSquareCentimetre: {
      name: 'calorieThermochemicalPerSquareCentimetre',
      label: 'calorie (thermochemical) per square centimetre',
      symbol: 'calth/cm²',
      code: 'P39',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerSquareMetre'];
      },
      conversionFactor: '4.184 × 10⁴ J/m²',
      quantityKinds: ['radianceExposure', 'radiantEnergyFluence', 'radiantEnergyFluence', 'radianceExposure', 'energyFluence']
    },
    calorieThermochemicalPerSquareCentimetreMinute: {
      name: 'calorieThermochemicalPerSquareCentimetreMinute',
      label: 'calorie (thermochemical) per square centimetre minute',
      symbol: 'calth/(cm²·min)',
      code: 'N56',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '6.973333 × 10² W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'densityOfHeatFlowRate'
      ]
    },
    calorieThermochemicalPerSquareCentimetreSecond: {
      name: 'calorieThermochemicalPerSquareCentimetreSecond',
      label: 'calorie (thermochemical) per square centimetre second',
      symbol: 'calth/(cm²·s)',
      code: 'N57',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '4.184 × 10⁴ W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'densityOfHeatFlowRate'
      ]
    },
    candela: {
      name: 'candela',
      label: 'candela',
      symbol: 'cd',
      code: 'CDL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['luminousIntensity']
    },
    candelaPerSquareFoot: {
      name: 'candelaPerSquareFoot',
      label: 'candela per square foot',
      symbol: 'cd/ft²',
      code: 'P32',
      referenceUnit: function () {
        return sammUDefinition.units['candelaPerSquareMetre'];
      },
      conversionFactor: '1.076391 × 10 cd/m²',
      quantityKinds: ['luminance', 'luminance']
    },
    candelaPerSquareInch: {
      name: 'candelaPerSquareInch',
      label: 'candela per square inch',
      symbol: 'cd/in²',
      code: 'P28',
      referenceUnit: function () {
        return sammUDefinition.units['candelaPerSquareMetre'];
      },
      conversionFactor: '1.550003 × 10³ cd/m²',
      quantityKinds: ['luminance', 'luminance']
    },
    candelaPerSquareMetre: {
      name: 'candelaPerSquareMetre',
      label: 'candela per square metre',
      symbol: 'cd/m²',
      code: 'A24',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['luminance']
    },
    card: {
      name: 'card',
      label: 'card',
      symbol: null,
      code: 'CG',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    carryingCapacityInMetricTon: {
      name: 'carryingCapacityInMetricTon',
      label: 'carrying capacity in metric ton',
      symbol: null,
      code: 'CCT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    centalUk: {
      name: 'centalUk',
      label: 'cental (UK)',
      symbol: null,
      code: 'CNT',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '45.359237 kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    centigram: {
      name: 'centigram',
      label: 'centigram',
      symbol: 'cg',
      code: 'CGM',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10⁻⁵ kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass', 'mass']
    },
    centilitre: {
      name: 'centilitre',
      label: 'centilitre',
      symbol: 'cl',
      code: 'CLT',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻⁵ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    centimetre: {
      name: 'centimetre',
      label: 'centimetre',
      symbol: 'cm',
      code: 'CMT',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁻² m',
      quantityKinds: [
        'diameter',
        'height',
        'radiusOfCurvature',
        'distance',
        'thickness',
        'cartesianCoordinates',
        'breadth',
        'radius',
        'length',
        'lengthOfPath',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    centimetreOfMercury0Degreesc: {
      name: 'centimetreOfMercury0Degreesc',
      label: 'centimetre of mercury (0 °C)',
      symbol: 'cmHg (0 °C)',
      code: 'N13',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '1.33322 × 10³ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfCompression',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'pressure',
        'shearModulus',
        'normalStress',
        'bulkModulus',
        'shearStress'
      ]
    },
    centimetreOfWater4Degreesc: {
      name: 'centimetreOfWater4Degreesc',
      label: 'centimetre of water (4 °C)',
      symbol: 'cmH₂O (4 °C)',
      code: 'N14',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '9.80638 × 10 Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfElasticity',
        'pressure',
        'shearStress',
        'modulusOfCompression',
        'shearModulus',
        'normalStress',
        'bulkModulus',
        'modulusOfRigidity'
      ]
    },
    centimetrePerBar: {
      name: 'centimetrePerBar',
      label: 'centimetre per bar',
      symbol: 'cm/bar',
      code: 'G04',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'radius',
        'length',
        'diameter',
        'height',
        'thickness',
        'breadth',
        'lengthOfPath',
        'distance',
        'cartesianCoordinates',
        'radiusOfCurvature'
      ]
    },
    centimetrePerHour: {
      name: 'centimetrePerHour',
      label: 'centimetre per hour',
      symbol: 'cm/h',
      code: 'H49',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity']
    },
    centimetrePerKelvin: {
      name: 'centimetrePerKelvin',
      label: 'centimetre per kelvin',
      symbol: 'cm/K',
      code: 'F51',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'diameter',
        'radius',
        'height',
        'thickness',
        'length',
        'radiusOfCurvature',
        'breadth',
        'cartesianCoordinates',
        'distance',
        'lengthOfPath'
      ]
    },
    centimetrePerSecond: {
      name: 'centimetrePerSecond',
      label: 'centimetre per second',
      symbol: 'cm/s',
      code: '2M',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '10⁻² m/s',
      quantityKinds: [
        'velocity',
        'groupVelocity',
        'phaseVelocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    centimetrePerSecondBar: {
      name: 'centimetrePerSecondBar',
      label: 'centimetre per second bar',
      symbol: '(cm/s)/bar',
      code: 'J85',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondPascal'];
      },
      conversionFactor: '10⁻⁷ (m/s)/Pa',
      quantityKinds: ['groupVelocity', 'velocity', 'phaseVelocity', 'velocity', 'phaseVelocity', 'groupVelocity']
    },
    centimetrePerSecondKelvin: {
      name: 'centimetrePerSecondKelvin',
      label: 'centimetre per second kelvin',
      symbol: '(cm/s)/K',
      code: 'J84',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondKelvin'];
      },
      conversionFactor: '10⁻² (m/s)/K',
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity', 'phaseVelocity', 'velocity', 'groupVelocity']
    },
    centimetrePerSecondSquared: {
      name: 'centimetrePerSecondSquared',
      label: 'centimetre per second squared',
      symbol: 'cm/s²',
      code: 'M39',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '10⁻² m/s²',
      quantityKinds: [
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'acceleration',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    centinewtonMetre: {
      name: 'centinewtonMetre',
      label: 'centinewton metre',
      symbol: 'cN·m',
      code: 'J72',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '10⁻² N × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple', 'momentOfACouple', 'torque', 'momentOfForce']
    },
    centipoise: {
      name: 'centipoise',
      label: 'centipoise',
      symbol: 'cP',
      code: 'C7',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '10⁻³ Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    centipoisePerBar: {
      name: 'centipoisePerBar',
      label: 'centipoise per bar',
      symbol: 'cP/bar',
      code: 'J74',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁸ s',
      quantityKinds: [
        'viscosityDynamicViscosity',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    centipoisePerKelvin: {
      name: 'centipoisePerKelvin',
      label: 'centipoise per kelvin',
      symbol: 'cP/K',
      code: 'J73',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['viscosityDynamicViscosity']
    },
    centistokes: {
      name: 'centistokes',
      label: 'centistokes',
      symbol: 'cSt',
      code: '4C',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerSecond'];
      },
      conversionFactor: '10⁻⁶ m²/s',
      quantityKinds: [
        'kinematicViscosity',
        'diffusionCoefficient',
        'thermalDiffusionCoefficient',
        'kinematicViscosity',
        'diffusionCoefficientForNeutronNumberDensity',
        'thermalDiffusivity'
      ]
    },
    chainBasedOnUsSurveyFoot: {
      name: 'chainBasedOnUsSurveyFoot',
      label: 'chain (based on U.S. survey foot)',
      symbol: 'ch (US survey)',
      code: 'M49',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '2.011684 × 10 m',
      quantityKinds: [
        'cartesianCoordinates',
        'radiusOfCurvature',
        'thickness',
        'length',
        'height',
        'radius',
        'lengthOfPath',
        'distance',
        'breadth',
        'diameter',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    circularMil: {
      name: 'circularMil',
      label: 'circular mil',
      symbol: 'cmil',
      code: 'M47',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '5.067075 × 10⁻¹⁰ m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    clo: {
      name: 'clo',
      label: 'clo',
      symbol: 'clo',
      code: 'J83',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetreKelvinPerWatt'];
      },
      conversionFactor: '0.155 m² × K/W',
      quantityKinds: ['thermalInsulance', 'coefficientOfThermalInsulation', 'coefficientOfThermalInsulation', 'thermalInsulance']
    },
    coilGroup: {
      name: 'coilGroup',
      label: 'coil group',
      symbol: null,
      code: 'C9',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    commonYear: {
      name: 'commonYear',
      label: 'common year',
      symbol: 'y (365 days)',
      code: 'L95',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '3.1536 × 10⁷ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'time'
      ]
    },
    contentGram: {
      name: 'contentGram',
      label: 'content gram',
      symbol: null,
      code: 'CTG',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    contentTonMetric: {
      name: 'contentTonMetric',
      label: 'content ton (metric)',
      symbol: null,
      code: 'CTN',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    conventionalMetreOfWater: {
      name: 'conventionalMetreOfWater',
      label: 'conventional metre of water',
      symbol: 'mH₂O',
      code: 'N23',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '9.80665 × 10³ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'shearModulus',
        'normalStress',
        'modulusOfCompression',
        'pressure',
        'shearStress',
        'bulkModulus'
      ]
    },
    cord: {
      name: 'cord',
      label: 'cord',
      symbol: null,
      code: 'WCD',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '3.63 m³',
      quantityKinds: ['volume', 'sectionModulus']
    },
    cord128Ft3: {
      name: 'cord128Ft3',
      label: 'cord (128 ft3)',
      symbol: 'cord',
      code: 'M68',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '3.624556 m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    coulomb: {
      name: 'coulomb',
      label: 'coulomb',
      symbol: 'C',
      code: 'COU',
      referenceUnit: function () {
        return sammUDefinition.units['ampereSecond'];
      },
      conversionFactor: 'A × s',
      quantityKinds: [
        'quantityOfElectricity',
        'electricCharge',
        'electricFluxFluxOfDisplacement',
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge'
      ]
    },
    coulombMetre: {
      name: 'coulombMetre',
      label: 'coulomb metre',
      symbol: 'C·m',
      code: 'A26',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricDipoleMomentOfMolecule', 'electricDipoleMoment']
    },
    coulombMetreSquaredPerVolt: {
      name: 'coulombMetreSquaredPerVolt',
      label: 'coulomb metre squared per volt',
      symbol: 'C·m²/V',
      code: 'A27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricPolarizabilityOfAMolecule']
    },
    coulombPerCubicCentimetre: {
      name: 'coulombPerCubicCentimetre',
      label: 'coulomb per cubic centimetre',
      symbol: 'C/cm³',
      code: 'A28',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerCubicMetre'];
      },
      conversionFactor: '10⁶ C/m³',
      quantityKinds: ['volumicCharge', 'volumeDensityOfCharge', 'chargeDensity', 'chargeDensity', 'volumeDensityOfCharge', 'volumicCharge']
    },
    coulombPerCubicMetre: {
      name: 'coulombPerCubicMetre',
      label: 'coulomb per cubic metre',
      symbol: 'C/m³',
      code: 'A29',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicCharge', 'volumeDensityOfCharge', 'chargeDensity']
    },
    coulombPerCubicMillimetre: {
      name: 'coulombPerCubicMillimetre',
      label: 'coulomb per cubic millimetre',
      symbol: 'C/mm³',
      code: 'A30',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerCubicMetre'];
      },
      conversionFactor: '10⁹ C/m³',
      quantityKinds: ['volumeDensityOfCharge', 'volumicCharge', 'chargeDensity', 'volumicCharge', 'volumeDensityOfCharge', 'chargeDensity']
    },
    coulombPerKilogram: {
      name: 'coulombPerKilogram',
      label: 'coulomb per kilogram',
      symbol: 'C/kg',
      code: 'CKG',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['exposure']
    },
    coulombPerKilogramSecond: {
      name: 'coulombPerKilogramSecond',
      label: 'coulomb per kilogram second',
      symbol: 'C/(kg·s)',
      code: 'A31',
      referenceUnit: function () {
        return sammUDefinition.units['amperePerKilogram'];
      },
      conversionFactor: 'A/kg',
      quantityKinds: ['exposureRate', 'currentDensity']
    },
    coulombPerMetre: {
      name: 'coulombPerMetre',
      label: 'coulomb per metre',
      symbol: 'C/m',
      code: 'P10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['lineicCharge']
    },
    coulombPerMole: {
      name: 'coulombPerMole',
      label: 'coulomb per mole',
      symbol: 'C/mol',
      code: 'A32',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['faradayConstant']
    },
    coulombPerSquareCentimetre: {
      name: 'coulombPerSquareCentimetre',
      label: 'coulomb per square centimetre',
      symbol: 'C/cm²',
      code: 'A33',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerSquareMetre'];
      },
      conversionFactor: '10⁴ C/m²',
      quantityKinds: [
        'surfaceDensityOfCharge',
        'electricFluxDensity',
        'displacementElectricPolarization',
        'displacementElectricPolarization',
        'surfaceDensityOfCharge',
        'electricFluxDensity'
      ]
    },
    coulombPerSquareMetre: {
      name: 'coulombPerSquareMetre',
      label: 'coulomb per square metre',
      symbol: 'C/m²',
      code: 'A34',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['surfaceDensityOfCharge', 'electricFluxDensity', 'displacementElectricPolarization']
    },
    coulombPerSquareMillimetre: {
      name: 'coulombPerSquareMillimetre',
      label: 'coulomb per square millimetre',
      symbol: 'C/mm²',
      code: 'A35',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerSquareMetre'];
      },
      conversionFactor: '10⁶ C/m²',
      quantityKinds: [
        'surfaceDensityOfCharge',
        'electricFluxDensity',
        'displacementElectricPolarization',
        'electricFluxDensity',
        'surfaceDensityOfCharge',
        'displacementElectricPolarization'
      ]
    },
    coulombSquareMetrePerKilogram: {
      name: 'coulombSquareMetrePerKilogram',
      label: 'coulomb square metre per kilogram',
      symbol: 'C·m²/kg',
      code: 'J53',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['exposure']
    },
    credit: {
      name: 'credit',
      label: 'credit',
      symbol: null,
      code: 'B17',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    cubicCentimetre: {
      name: 'cubicCentimetre',
      label: 'cubic centimetre',
      symbol: 'cm³',
      code: 'CMQ',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻⁶ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicCentimetrePerBar: {
      name: 'cubicCentimetrePerBar',
      label: 'cubic centimetre per bar',
      symbol: 'cm³/bar',
      code: 'G94',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volume']
    },
    cubicCentimetrePerCubicMetre: {
      name: 'cubicCentimetrePerCubicMetre',
      label: 'cubic centimetre per cubic metre',
      symbol: 'cm³/m³',
      code: 'J87',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeRatio']
    },
    cubicCentimetrePerDay: {
      name: 'cubicCentimetrePerDay',
      label: 'cubic centimetre per day',
      symbol: 'cm³/d',
      code: 'G47',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerDayBar: {
      name: 'cubicCentimetrePerDayBar',
      label: 'cubic centimetre per day bar',
      symbol: 'cm³/(d·bar)',
      code: 'G78',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerDayKelvin: {
      name: 'cubicCentimetrePerDayKelvin',
      label: 'cubic centimetre per day kelvin',
      symbol: 'cm³/(d·K)',
      code: 'G61',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerHour: {
      name: 'cubicCentimetrePerHour',
      label: 'cubic centimetre per hour',
      symbol: 'cm³/h',
      code: 'G48',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerHourBar: {
      name: 'cubicCentimetrePerHourBar',
      label: 'cubic centimetre per hour bar',
      symbol: 'cm³/(h·bar)',
      code: 'G79',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerHourKelvin: {
      name: 'cubicCentimetrePerHourKelvin',
      label: 'cubic centimetre per hour kelvin',
      symbol: 'cm³/(h·K)',
      code: 'G62',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerKelvin: {
      name: 'cubicCentimetrePerKelvin',
      label: 'cubic centimetre per kelvin',
      symbol: 'cm³/K',
      code: 'G27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumePerTemperature']
    },
    cubicCentimetrePerMinute: {
      name: 'cubicCentimetrePerMinute',
      label: 'cubic centimetre per minute',
      symbol: 'cm³/min',
      code: 'G49',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerMinuteBar: {
      name: 'cubicCentimetrePerMinuteBar',
      label: 'cubic centimetre per minute bar',
      symbol: 'cm³/(min·bar)',
      code: 'G80',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerMinuteKelvin: {
      name: 'cubicCentimetrePerMinuteKelvin',
      label: 'cubic centimetre per minute kelvin',
      symbol: 'cm³/(min·K)',
      code: 'G63',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerMole: {
      name: 'cubicCentimetrePerMole',
      label: 'cubic centimetre per mole',
      symbol: 'cm³/mol',
      code: 'A36',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerMole'];
      },
      conversionFactor: '10⁻⁶ m³/mol',
      quantityKinds: ['molarVolume', 'molarVolume']
    },
    cubicCentimetrePerSecond: {
      name: 'cubicCentimetrePerSecond',
      label: 'cubic centimetre per second',
      symbol: 'cm³/s',
      code: '2J',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicCentimetrePerSecondBar: {
      name: 'cubicCentimetrePerSecondBar',
      label: 'cubic centimetre per second bar',
      symbol: 'cm³/(s·bar)',
      code: 'G81',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicCentimetrePerSecondKelvin: {
      name: 'cubicCentimetrePerSecondKelvin',
      label: 'cubic centimetre per second kelvin',
      symbol: 'cm³/(s·K)',
      code: 'G64',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicDecametre: {
      name: 'cubicDecametre',
      label: 'cubic decametre',
      symbol: 'dam³',
      code: 'DMA',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicDecimetre: {
      name: 'cubicDecimetre',
      label: 'cubic decimetre',
      symbol: 'dm³',
      code: 'DMQ',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicDecimetrePerCubicMetre: {
      name: 'cubicDecimetrePerCubicMetre',
      label: 'cubic decimetre per cubic metre',
      symbol: 'dm³/m³',
      code: 'J91',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeRatio']
    },
    cubicDecimetrePerDay: {
      name: 'cubicDecimetrePerDay',
      label: 'cubic decimetre per day',
      symbol: 'dm³/d',
      code: 'J90',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.15741 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    cubicDecimetrePerHour: {
      name: 'cubicDecimetrePerHour',
      label: 'cubic decimetre per hour',
      symbol: 'dm³/h',
      code: 'E92',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicDecimetrePerKilogram: {
      name: 'cubicDecimetrePerKilogram',
      label: 'cubic decimetre per kilogram',
      symbol: 'dm³/kg',
      code: 'N28',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificVolume', 'massicVolume']
    },
    cubicDecimetrePerMinute: {
      name: 'cubicDecimetrePerMinute',
      label: 'cubic decimetre per minute',
      symbol: 'dm³/min',
      code: 'J92',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.66667 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicDecimetrePerMole: {
      name: 'cubicDecimetrePerMole',
      label: 'cubic decimetre per mole',
      symbol: 'dm³/mol',
      code: 'A37',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerMole'];
      },
      conversionFactor: '10⁻³ m³/mol',
      quantityKinds: ['molarVolume', 'molarVolume']
    },
    cubicDecimetrePerSecond: {
      name: 'cubicDecimetrePerSecond',
      label: 'cubic decimetre per second',
      symbol: 'dm³/s',
      code: 'J93',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '10⁻³ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicFoot: {
      name: 'cubicFoot',
      label: 'cubic foot',
      symbol: 'ft³',
      code: 'FTQ',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '2.831685 × 10⁻² m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicFootPerDay: {
      name: 'cubicFootPerDay',
      label: 'cubic foot per day',
      symbol: 'ft³/d',
      code: 'K22',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.277413 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    cubicFootPerDegreeFahrenheit: {
      name: 'cubicFootPerDegreeFahrenheit',
      label: 'cubic foot per degree Fahrenheit',
      symbol: 'ft³/°F',
      code: 'K21',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerKelvin'];
      },
      conversionFactor: '5.097033 × 10⁻² m³/K',
      quantityKinds: ['volume', 'volumePerTemperature']
    },
    cubicFootPerHour: {
      name: 'cubicFootPerHour',
      label: 'cubic foot per hour',
      symbol: 'ft³/h',
      code: '2K',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '7.86579 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicFootPerMinute: {
      name: 'cubicFootPerMinute',
      label: 'cubic foot per minute',
      symbol: 'ft³/min',
      code: '2L',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.719474 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicFootPerPound: {
      name: 'cubicFootPerPound',
      label: 'cubic foot per pound',
      symbol: 'ft³/lb',
      code: 'N29',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerKilogram'];
      },
      conversionFactor: '6.242796 × 10⁻² m³/kg',
      quantityKinds: ['specificVolume', 'massicVolume', 'massicVolume', 'specificVolume']
    },
    cubicFootPerPsi: {
      name: 'cubicFootPerPsi',
      label: 'cubic foot per psi',
      symbol: 'ft³/psi',
      code: 'K23',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerPascal'];
      },
      conversionFactor: '4.107012 × 10⁻⁶ m³/Pa',
      quantityKinds: ['volume', 'volume']
    },
    cubicFootPerSecond: {
      name: 'cubicFootPerSecond',
      label: 'cubic foot per second',
      symbol: 'ft³/s',
      code: 'E17',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.831685 × 10⁻² m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicHectometre: {
      name: 'cubicHectometre',
      label: 'cubic hectometre',
      symbol: 'hm³',
      code: 'H19',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁶ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicInch: {
      name: 'cubicInch',
      label: 'cubic inch',
      symbol: 'in³',
      code: 'INQ',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '16.387064 × 10⁻⁶ m³',
      quantityKinds: ['sectionModulus', 'volume', 'volume', 'sectionModulus']
    },
    cubicInchPerHour: {
      name: 'cubicInchPerHour',
      label: 'cubic inch per hour',
      symbol: 'in³/h',
      code: 'G56',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicInchPerMinute: {
      name: 'cubicInchPerMinute',
      label: 'cubic inch per minute',
      symbol: 'in³/min',
      code: 'G57',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicInchPerPound: {
      name: 'cubicInchPerPound',
      label: 'cubic inch per pound',
      symbol: 'in³/lb',
      code: 'N30',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerKilogram'];
      },
      conversionFactor: '3.612728 × 10⁻⁵ m³/kg',
      quantityKinds: ['specificVolume', 'massicVolume', 'massicVolume', 'specificVolume']
    },
    cubicInchPerSecond: {
      name: 'cubicInchPerSecond',
      label: 'cubic inch per second',
      symbol: 'in³/s',
      code: 'G58',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicKilometre: {
      name: 'cubicKilometre',
      label: 'cubic kilometre',
      symbol: 'km³',
      code: 'H20',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁹ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicMetre: {
      name: 'cubicMetre',
      label: 'cubic metre',
      symbol: 'm³',
      code: 'MTQ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volume', 'sectionModulus']
    },
    cubicMetrePerBar: {
      name: 'cubicMetrePerBar',
      label: 'cubic metre per bar',
      symbol: 'm³/bar',
      code: 'G96',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volume']
    },
    cubicMetrePerCoulomb: {
      name: 'cubicMetrePerCoulomb',
      label: 'cubic metre per coulomb',
      symbol: 'm³/C',
      code: 'A38',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hallCoefficient']
    },
    cubicMetrePerCubicMetre: {
      name: 'cubicMetrePerCubicMetre',
      label: 'cubic metre per cubic metre',
      symbol: 'm³/m³',
      code: 'H60',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeRatio']
    },
    cubicMetrePerDay: {
      name: 'cubicMetrePerDay',
      label: 'cubic metre per day',
      symbol: 'm³/d',
      code: 'G52',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerDayBar: {
      name: 'cubicMetrePerDayBar',
      label: 'cubic metre per day bar',
      symbol: 'm³/(d·bar)',
      code: 'G86',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerDayKelvin: {
      name: 'cubicMetrePerDayKelvin',
      label: 'cubic metre per day kelvin',
      symbol: 'm³/(d·K)',
      code: 'G69',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerHour: {
      name: 'cubicMetrePerHour',
      label: 'cubic metre per hour',
      symbol: 'm³/h',
      code: 'MQH',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicMetrePerHourBar: {
      name: 'cubicMetrePerHourBar',
      label: 'cubic metre per hour bar',
      symbol: 'm³/(h·bar)',
      code: 'G87',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerHourKelvin: {
      name: 'cubicMetrePerHourKelvin',
      label: 'cubic metre per hour kelvin',
      symbol: 'm³/(h·K)',
      code: 'G70',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerKelvin: {
      name: 'cubicMetrePerKelvin',
      label: 'cubic metre per kelvin',
      symbol: 'm³/K',
      code: 'G29',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumePerTemperature']
    },
    cubicMetrePerKilogram: {
      name: 'cubicMetrePerKilogram',
      label: 'cubic metre per kilogram',
      symbol: 'm³/kg',
      code: 'A39',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificVolume', 'massicVolume']
    },
    cubicMetrePerMinute: {
      name: 'cubicMetrePerMinute',
      label: 'cubic metre per minute',
      symbol: 'm³/min',
      code: 'G53',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerMinuteBar: {
      name: 'cubicMetrePerMinuteBar',
      label: 'cubic metre per minute bar',
      symbol: 'm³/(min·bar)',
      code: 'G88',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerMinuteKelvin: {
      name: 'cubicMetrePerMinuteKelvin',
      label: 'cubic metre per minute kelvin',
      symbol: 'm³/(min·K)',
      code: 'G71',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerMole: {
      name: 'cubicMetrePerMole',
      label: 'cubic metre per mole',
      symbol: 'm³/mol',
      code: 'A40',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['molarVolume']
    },
    cubicMetrePerPascal: {
      name: 'cubicMetrePerPascal',
      label: 'cubic metre per pascal',
      symbol: 'm³/Pa',
      code: 'M71',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volume']
    },
    cubicMetrePerSecond: {
      name: 'cubicMetrePerSecond',
      label: 'cubic metre per second',
      symbol: 'm³/s',
      code: 'MQS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicMetrePerSecondBar: {
      name: 'cubicMetrePerSecondBar',
      label: 'cubic metre per second bar',
      symbol: 'm³/(s·bar)',
      code: 'G89',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerSecondKelvin: {
      name: 'cubicMetrePerSecondKelvin',
      label: 'cubic metre per second kelvin',
      symbol: 'm³/(s·K)',
      code: 'G72',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerSecondPascal: {
      name: 'cubicMetrePerSecondPascal',
      label: 'cubic metre per second pascal',
      symbol: '(m³/s)/Pa',
      code: 'N45',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    cubicMetrePerSecondSquareMetre: {
      name: 'cubicMetrePerSecondSquareMetre',
      label: 'cubic metre per second square metre',
      symbol: '(m³/s)/m²',
      code: 'P87',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: 'm/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'porosity'
      ]
    },
    cubicMicrometre: {
      name: 'cubicMicrometre',
      label: 'cubic micrometre',
      symbol: 'µm³',
      code: null,
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻¹⁸ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicMileUkStatute: {
      name: 'cubicMileUkStatute',
      label: 'cubic mile (UK statute)',
      symbol: 'mi³',
      code: 'M69',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '4.168182 × 10⁹ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicMillimetre: {
      name: 'cubicMillimetre',
      label: 'cubic millimetre',
      symbol: 'mm³',
      code: 'MMQ',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻⁹ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicMillimetrePerCubicMetre: {
      name: 'cubicMillimetrePerCubicMetre',
      label: 'cubic millimetre per cubic metre',
      symbol: 'mm³/m³',
      code: 'L21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeRatio']
    },
    cubicYard: {
      name: 'cubicYard',
      label: 'cubic yard',
      symbol: 'yd³',
      code: 'YDQ',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '0.764555 m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    cubicYardPerDay: {
      name: 'cubicYardPerDay',
      label: 'cubic yard per day',
      symbol: 'yd³/d',
      code: 'M12',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '8.849015 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicYardPerDegreeFahrenheit: {
      name: 'cubicYardPerDegreeFahrenheit',
      label: 'cubic yard per degree Fahrenheit',
      symbol: 'yd³/°F',
      code: 'M11',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerKelvin'];
      },
      conversionFactor: '1.376199 m³/K',
      quantityKinds: ['volume', 'volumePerTemperature']
    },
    cubicYardPerHour: {
      name: 'cubicYardPerHour',
      label: 'cubic yard per hour',
      symbol: 'yd³/h',
      code: 'M13',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.123764 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicYardPerMinute: {
      name: 'cubicYardPerMinute',
      label: 'cubic yard per minute',
      symbol: 'yd³/min',
      code: 'M15',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.274258 × 10⁻² m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    cubicYardPerPsi: {
      name: 'cubicYardPerPsi',
      label: 'cubic yard per psi',
      symbol: 'yd³/psi',
      code: 'M14',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerPascal'];
      },
      conversionFactor: '1.108893 × 10⁻⁴ m³/Pa',
      quantityKinds: ['volume', 'volume']
    },
    cubicYardPerSecond: {
      name: 'cubicYardPerSecond',
      label: 'cubic yard per second',
      symbol: 'yd³/s',
      code: 'M16',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '0.7645549 m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    cupUnitOfVolume: {
      name: 'cupUnitOfVolume',
      label: 'cup [unit of volume]',
      symbol: 'cup (US)',
      code: 'G21',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '2.365882 × 10⁻⁴ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    curie: {
      name: 'curie',
      label: 'curie',
      symbol: 'Ci',
      code: 'CUR',
      referenceUnit: function () {
        return sammUDefinition.units['becquerel'];
      },
      conversionFactor: '3.7 × 10¹⁰ Bq',
      quantityKinds: ['activity', 'activity']
    },
    curiePerKilogram: {
      name: 'curiePerKilogram',
      label: 'curie per kilogram',
      symbol: 'Ci/kg',
      code: 'A42',
      referenceUnit: function () {
        return sammUDefinition.units['becquerelPerKilogram'];
      },
      conversionFactor: '3.7 × 10¹⁰ Bq/kg',
      quantityKinds: ['specificActivityInASample', 'specificActivityInASample']
    },
    cycle: {
      name: 'cycle',
      label: 'cycle',
      symbol: null,
      code: 'B7',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    day: {
      name: 'day',
      label: 'day',
      symbol: 'd',
      code: 'DAY',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '86400 s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    deadweightTonnage: {
      name: 'deadweightTonnage',
      label: 'deadweight tonnage',
      symbol: 'dwt',
      code: 'A43',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    decade: {
      name: 'decade',
      label: 'decade',
      symbol: null,
      code: 'DEC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    decadeLogarithmic: {
      name: 'decadeLogarithmic',
      label: 'decade (logarithmic)',
      symbol: 'dec',
      code: 'P41',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['logarithmicDecrement']
    },
    decagram: {
      name: 'decagram',
      label: 'decagram',
      symbol: 'dag',
      code: 'DJ',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10⁻² kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    decalitre: {
      name: 'decalitre',
      label: 'decalitre',
      symbol: 'dal',
      code: 'A44',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻² m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    decametre: {
      name: 'decametre',
      label: 'decametre',
      symbol: 'dam',
      code: 'A45',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10 m',
      quantityKinds: [
        'cartesianCoordinates',
        'breadth',
        'height',
        'lengthOfPath',
        'radiusOfCurvature',
        'distance',
        'diameter',
        'length',
        'thickness',
        'radius',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    decapascal: {
      name: 'decapascal',
      label: 'decapascal',
      symbol: 'daPa',
      code: 'H75',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10¹ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'shearStress',
        'modulusOfRigidity',
        'normalStress',
        'modulusOfCompression',
        'shearModulus',
        'modulusOfElasticity',
        'pressure',
        'bulkModulus'
      ]
    },
    decare: {
      name: 'decare',
      label: 'decare',
      symbol: 'daa',
      code: 'DAA',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10³ m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    decibel: {
      name: 'decibel',
      label: 'decibel',
      symbol: 'dB',
      code: '2N',
      referenceUnit: function () {
        return sammUDefinition.units['neper'];
      },
      conversionFactor: '0.1151293 Np',
      quantityKinds: [
        'logarithmicDecrement',
        'levelOfAPowerQuantity',
        'levelOfAFieldQuantity',
        'soundPressureLevel',
        'levelOfAFieldQuantity',
        'levelOfAPowerQuantity',
        'soundPowerLevel',
        'soundReductionIndex'
      ]
    },
    decibelPerKilometre: {
      name: 'decibelPerKilometre',
      label: 'decibel per kilometre',
      symbol: 'dB/km',
      code: 'H51',
      referenceUnit: function () {
        return sammUDefinition.units['belPerMetre'];
      },
      conversionFactor: '10⁻⁴ B/m',
      quantityKinds: ['soundPressureLevel', 'soundPowerLevel', 'soundPressureLevel', 'soundPowerLevel']
    },
    decibelPerMetre: {
      name: 'decibelPerMetre',
      label: 'decibel per metre',
      symbol: 'dB/m',
      code: 'H52',
      referenceUnit: function () {
        return sammUDefinition.units['belPerMetre'];
      },
      conversionFactor: '10⁻¹ B/m',
      quantityKinds: ['soundPressureLevel', 'soundPowerLevel', 'soundPressureLevel', 'soundPowerLevel']
    },
    decigram: {
      name: 'decigram',
      label: 'decigram',
      symbol: 'dg',
      code: 'DG',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10⁻⁴ kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    decilitre: {
      name: 'decilitre',
      label: 'decilitre',
      symbol: 'dl',
      code: 'DLT',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻⁴ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    decilitrePerGram: {
      name: 'decilitrePerGram',
      label: 'decilitre per gram',
      symbol: 'dl/g',
      code: '22',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerKilogram'];
      },
      conversionFactor: '10⁻¹ × m³/kg',
      quantityKinds: ['specificVolume', 'massicVolume', 'specificVolume', 'massicVolume']
    },
    decimetre: {
      name: 'decimetre',
      label: 'decimetre',
      symbol: 'dm',
      code: 'DMT',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁻¹ m',
      quantityKinds: [
        'distance',
        'radius',
        'cartesianCoordinates',
        'lengthOfPath',
        'height',
        'thickness',
        'breadth',
        'length',
        'radiusOfCurvature',
        'diameter',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    decinewtonMetre: {
      name: 'decinewtonMetre',
      label: 'decinewton metre',
      symbol: 'dN·m',
      code: 'DN',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '10⁻¹ N × m',
      quantityKinds: ['momentOfForce', 'torque', 'momentOfACouple', 'torque', 'momentOfForce', 'momentOfACouple']
    },
    decitex: {
      name: 'decitex',
      label: 'decitex',
      symbol: 'dtex (g/10km)',
      code: 'A47',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    decitonne: {
      name: 'decitonne',
      label: 'decitonne',
      symbol: 'dt or dtn',
      code: 'DTN',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10² kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass', 'mass']
    },
    degreeApi: {
      name: 'degreeApi',
      label: 'degree API',
      symbol: '°API',
      code: 'J13',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeBalling: {
      name: 'degreeBalling',
      label: 'degree Balling',
      symbol: '°Balling',
      code: 'J17',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeBaumeOriginScale: {
      name: 'degreeBaumeOriginScale',
      label: 'degree Baume (origin scale)',
      symbol: '°Bé',
      code: 'J14',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeBaumeUsHeavy: {
      name: 'degreeBaumeUsHeavy',
      label: 'degree Baume (US heavy)',
      symbol: '°Bé (US heavy)',
      code: 'J15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeBaumeUsLight: {
      name: 'degreeBaumeUsLight',
      label: 'degree Baume (US light)',
      symbol: '°Bé (US light)',
      code: 'J16',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeBrix: {
      name: 'degreeBrix',
      label: 'degree Brix',
      symbol: '°Bx',
      code: 'J18',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeCelsius: {
      name: 'degreeCelsius',
      label: 'degree Celsius',
      symbol: '°C',
      code: 'CEL',
      referenceUnit: function () {
        return sammUDefinition.units['kelvin'];
      },
      conversionFactor: '1 × K',
      quantityKinds: [
        'temperature',
        'fermiTemperature',
        'debyeTemperature',
        'thermodynamic',
        'superConductorTransitionTemperature',
        'neelTemperature',
        'curieTemperature'
      ]
    },
    degreeCelsiusPerBar: {
      name: 'degreeCelsiusPerBar',
      label: 'degree Celsius per bar',
      symbol: '°C/bar',
      code: 'F60',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    degreeCelsiusPerHour: {
      name: 'degreeCelsiusPerHour',
      label: 'degree Celsius per hour',
      symbol: '°C/h',
      code: 'H12',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    degreeCelsiusPerKelvin: {
      name: 'degreeCelsiusPerKelvin',
      label: 'degree Celsius per kelvin',
      symbol: '°C/K',
      code: 'E98',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    degreeCelsiusPerMinute: {
      name: 'degreeCelsiusPerMinute',
      label: 'degree Celsius per minute',
      symbol: '°C/min',
      code: 'H13',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    degreeCelsiusPerSecond: {
      name: 'degreeCelsiusPerSecond',
      label: 'degree Celsius per second',
      symbol: '°C/s',
      code: 'H14',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    degreeDay: {
      name: 'degreeDay',
      label: 'degree day',
      symbol: 'deg da',
      code: 'E10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeFahrenheit: {
      name: 'degreeFahrenheit',
      label: 'degree Fahrenheit',
      symbol: '°F',
      code: 'FAH',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['fahrenheitTemperature']
    },
    degreeFahrenheitHourPerBritishThermalUnitInternationalTable: {
      name: 'degreeFahrenheitHourPerBritishThermalUnitInternationalTable',
      label: 'degree Fahrenheit hour per British thermal unit (international table)',
      symbol: '°F/(BtuIT/h)',
      code: 'N84',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerWatt'];
      },
      conversionFactor: '1.895634 K/W',
      quantityKinds: ['thermalResistance', 'thermalResistance']
    },
    degreeFahrenheitHourPerBritishThermalUnitThermochemical: {
      name: 'degreeFahrenheitHourPerBritishThermalUnitThermochemical',
      label: 'degree Fahrenheit hour per British thermal unit (thermochemical)',
      symbol: '°F/(Btuth/h)',
      code: 'N85',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerWatt'];
      },
      conversionFactor: '1.896903 K/W',
      quantityKinds: ['thermalResistance', 'thermalResistance']
    },
    degreeFahrenheitHourSquareFootPerBritishThermalUnitInternationalTable: {
      name: 'degreeFahrenheitHourSquareFootPerBritishThermalUnitInternationalTable',
      label: 'degree Fahrenheit hour square foot per British thermal unit (international table)',
      symbol: '°F·h·ft²/BtuIT',
      code: 'J22',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetreKelvinPerWatt'];
      },
      conversionFactor: '0.1761102 m² × K/W',
      quantityKinds: ['thermalInsulance', 'coefficientOfThermalInsulation', 'thermalInsulance', 'coefficientOfThermalInsulation']
    },
    degreeFahrenheitHourSquareFootPerBritishThermalUnitInternationalTableInch: {
      name: 'degreeFahrenheitHourSquareFootPerBritishThermalUnitInternationalTableInch',
      label: 'degree Fahrenheit hour square foot per British thermal unit (international table) inch',
      symbol: '°F·h·ft²/(BtuIT·in)',
      code: 'N88',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinMetrePerWatt'];
      },
      conversionFactor: '6.933472 K × m/W',
      quantityKinds: ['thermalResistance', 'thermalResistance']
    },
    degreeFahrenheitHourSquareFootPerBritishThermalUnitThermochemical: {
      name: 'degreeFahrenheitHourSquareFootPerBritishThermalUnitThermochemical',
      label: 'degree Fahrenheit hour square foot per British thermal unit (thermochemical)',
      symbol: '°F·h·ft²/Btuth',
      code: 'J19',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetreKelvinPerWatt'];
      },
      conversionFactor: '0.176228 m² × K/W',
      quantityKinds: ['thermalInsulance', 'coefficientOfThermalInsulation', 'thermalInsulance', 'coefficientOfThermalInsulation']
    },
    degreeFahrenheitHourSquareFootPerBritishThermalUnitThermochemicalInch: {
      name: 'degreeFahrenheitHourSquareFootPerBritishThermalUnitThermochemicalInch',
      label: 'degree Fahrenheit hour square foot per British thermal unit (thermochemical) inch',
      symbol: '°F·h·ft²/(Btuth·in)',
      code: 'N89',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinMetrePerWatt'];
      },
      conversionFactor: '6.938112 K × m/W',
      quantityKinds: ['thermalResistance', 'thermalResistance']
    },
    degreeFahrenheitPerBar: {
      name: 'degreeFahrenheitPerBar',
      label: 'degree Fahrenheit per bar',
      symbol: '°F/bar',
      code: 'J21',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerPascal'];
      },
      conversionFactor: '0.5555556 × 10⁻⁵ K/Pa',
      quantityKinds: ['temperature', 'temperature']
    },
    degreeFahrenheitPerHour: {
      name: 'degreeFahrenheitPerHour',
      label: 'degree Fahrenheit per hour',
      symbol: '°F/h',
      code: 'J23',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerSecond'];
      },
      conversionFactor: '1.543210 × 10⁻⁴ K/s',
      quantityKinds: ['temperatureVariationOverTime', 'temperature']
    },
    degreeFahrenheitPerKelvin: {
      name: 'degreeFahrenheitPerKelvin',
      label: 'degree Fahrenheit per kelvin',
      symbol: '°F/K',
      code: 'J20',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    degreeFahrenheitPerMinute: {
      name: 'degreeFahrenheitPerMinute',
      label: 'degree Fahrenheit per minute',
      symbol: '°F/min',
      code: 'J24',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerSecond'];
      },
      conversionFactor: '9.259259 × 10⁻³ K/s',
      quantityKinds: ['temperatureVariationOverTime', 'temperature']
    },
    degreeFahrenheitPerSecond: {
      name: 'degreeFahrenheitPerSecond',
      label: 'degree Fahrenheit per second',
      symbol: '°F/s',
      code: 'J25',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerSecond'];
      },
      conversionFactor: '0.5555556 K/s',
      quantityKinds: ['temperatureVariationOverTime', 'temperature']
    },
    degreeFahrenheitSecondPerBritishThermalUnitInternationalTable: {
      name: 'degreeFahrenheitSecondPerBritishThermalUnitInternationalTable',
      label: 'degree Fahrenheit second per British thermal unit (international table)',
      symbol: '°F/(BtuIT/s)',
      code: 'N86',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerWatt'];
      },
      conversionFactor: '5.265651 × 10⁻⁴ K/W',
      quantityKinds: ['thermalResistance', 'thermalResistance']
    },
    degreeFahrenheitSecondPerBritishThermalUnitThermochemical: {
      name: 'degreeFahrenheitSecondPerBritishThermalUnitThermochemical',
      label: 'degree Fahrenheit second per British thermal unit (thermochemical)',
      symbol: '°F/(Btuth/s)',
      code: 'N87',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerWatt'];
      },
      conversionFactor: '5.269175 × 10⁻⁴ K/W',
      quantityKinds: ['thermalResistance', 'thermalResistance']
    },
    degreeOechsle: {
      name: 'degreeOechsle',
      label: 'degree Oechsle',
      symbol: '°Oechsle',
      code: 'J27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreePerMetre: {
      name: 'degreePerMetre',
      label: 'degree per metre',
      symbol: '°/m',
      code: 'H27',
      referenceUnit: function () {
        return sammUDefinition.units['radianPerMetre'];
      },
      conversionFactor: '1.745329 × 10⁻² rad/m',
      quantityKinds: [
        'angularWavenumber',
        'angularRepetency',
        'debyeAngularRepetency',
        'angularWaveNumber',
        'debyeAngularWaveNumber',
        'solidAngle'
      ]
    },
    degreePerSecond: {
      name: 'degreePerSecond',
      label: 'degree per second',
      symbol: '°/s',
      code: 'E96',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['solidAngle']
    },
    degreePlato: {
      name: 'degreePlato',
      label: 'degree Plato',
      symbol: '°P',
      code: 'PLA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeRankine: {
      name: 'degreeRankine',
      label: 'degree Rankine',
      symbol: '°R',
      code: 'A48',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    degreeRankinePerHour: {
      name: 'degreeRankinePerHour',
      label: 'degree Rankine per hour',
      symbol: '°R/h',
      code: 'J28',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerSecond'];
      },
      conversionFactor: '1.543210 × 10⁻⁴ K/s',
      quantityKinds: ['temperatureVariationOverTime', 'temperature']
    },
    degreeRankinePerMinute: {
      name: 'degreeRankinePerMinute',
      label: 'degree Rankine per minute',
      symbol: '°R/min',
      code: 'J29',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerSecond'];
      },
      conversionFactor: '9.259259 × 10⁻³ K/s',
      quantityKinds: ['temperatureVariationOverTime', 'temperature']
    },
    degreeRankinePerSecond: {
      name: 'degreeRankinePerSecond',
      label: 'degree Rankine per second',
      symbol: '°R/s',
      code: 'J30',
      referenceUnit: function () {
        return sammUDefinition.units['kelvinPerSecond'];
      },
      conversionFactor: '0.5555556 K/s',
      quantityKinds: ['temperature', 'temperatureVariationOverTime']
    },
    degreeTwaddell: {
      name: 'degreeTwaddell',
      label: 'degree Twaddell',
      symbol: '°Tw',
      code: 'J31',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    degreeUnitOfAngle: {
      name: 'degreeUnitOfAngle',
      label: 'degree [unit of angle]',
      symbol: '°',
      code: 'DD',
      referenceUnit: function () {
        return sammUDefinition.units['rad'];
      },
      conversionFactor: '1.745329 × 10⁻² rad',
      quantityKinds: ['absorbedDose', 'anglePlane', 'braggAngle']
    },
    degreeUnitOfAnglePerSecondSquared: {
      name: 'degreeUnitOfAnglePerSecondSquared',
      label: 'degree [unit of angle] per second squared',
      symbol: '°/s²',
      code: 'M45',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['angularAcceleration']
    },
    denier: {
      name: 'denier',
      label: 'denier',
      symbol: 'den (g/9 km)',
      code: 'A49',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '1.111111 × 10⁻⁷ kg/m',
      quantityKinds: ['linearDensity', 'linearMass', 'linearMass', 'linearDensity']
    },
    digit: {
      name: 'digit',
      label: 'digit',
      symbol: null,
      code: 'B19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dioptre: {
      name: 'dioptre',
      label: 'dioptre',
      symbol: 'dpt',
      code: 'Q25',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalMetre'];
      },
      conversionFactor: 'm⁻¹',
      quantityKinds: [
        'repetency',
        'curvature',
        'totalIonizationByAParticle',
        'macroscopicTotalCrossSection',
        'wavenumber',
        'phaseCoefficient',
        'waveNumber',
        'volumicCrossSection',
        'rydbergConstant',
        'linearIonizationByAParticle',
        'attenuationCoefficient',
        'lensPower',
        'vergence',
        'linearAttenuationCoefficient',
        'angularReciprocalLatticeVector',
        'propagationCoefficient',
        'angularWaveNumber',
        'linearExtinctionCoefficient',
        'fundamentalReciprocalLatticeVector',
        'angularRepetency',
        'volumicTotalCrossSection',
        'macroscopicCrossSection',
        'linearAbsorptionCoefficient'
      ]
    },
    displacementTonnage: {
      name: 'displacementTonnage',
      label: 'displacement tonnage',
      symbol: null,
      code: 'DPT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dose: {
      name: 'dose',
      label: 'dose',
      symbol: null,
      code: 'E27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dotsPerInch: {
      name: 'dotsPerInch',
      label: 'dots per inch',
      symbol: 'dpi',
      code: 'E39',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dozen: {
      name: 'dozen',
      label: 'dozen',
      symbol: 'DOZ',
      code: 'DZN',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dozenPack: {
      name: 'dozenPack',
      label: 'dozen pack',
      symbol: null,
      code: 'DZP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dozenPair: {
      name: 'dozenPair',
      label: 'dozen pair',
      symbol: null,
      code: 'DPR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dozenPiece: {
      name: 'dozenPiece',
      label: 'dozen piece',
      symbol: null,
      code: 'DPC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dozenRoll: {
      name: 'dozenRoll',
      label: 'dozen roll',
      symbol: null,
      code: 'DRL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dramUk: {
      name: 'dramUk',
      label: 'dram (UK)',
      symbol: null,
      code: 'DRI',
      referenceUnit: function () {
        return sammUDefinition.units['gram'];
      },
      conversionFactor: '1.771745 g',
      quantityKinds: ['mass']
    },
    dramUs: {
      name: 'dramUs',
      label: 'dram (US)',
      symbol: null,
      code: 'DRA',
      referenceUnit: function () {
        return sammUDefinition.units['gram'];
      },
      conversionFactor: '3.887935 g',
      quantityKinds: ['mass']
    },
    dryBarrelUs: {
      name: 'dryBarrelUs',
      label: 'dry barrel (US)',
      symbol: 'bbl (US)',
      code: 'BLD',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.15627 × 10⁻¹ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    dryGallonUs: {
      name: 'dryGallonUs',
      label: 'dry gallon (US)',
      symbol: 'dry gal (US)',
      code: 'GLD',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '4.404884 × 10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    dryPintUs: {
      name: 'dryPintUs',
      label: 'dry pint (US)',
      symbol: 'dry pt (US)',
      code: 'PTD',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '5.506105 × 10⁻⁴ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    dryPound: {
      name: 'dryPound',
      label: 'dry pound',
      symbol: null,
      code: 'DB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dryQuartUs: {
      name: 'dryQuartUs',
      label: 'dry quart (US)',
      symbol: 'dry qt (US)',
      code: 'QTD',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.101221 × 10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    dryTon: {
      name: 'dryTon',
      label: 'dry ton',
      symbol: null,
      code: 'DT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    dyneMetre: {
      name: 'dyneMetre',
      label: 'dyne metre',
      symbol: 'dyn·m',
      code: 'M97',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '10⁻⁵ N × m',
      quantityKinds: ['momentOfForce', 'torque', 'momentOfACouple', 'torque', 'momentOfForce', 'momentOfACouple']
    },
    each: {
      name: 'each',
      label: 'each',
      symbol: null,
      code: 'EA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    eightPartCloudCover: {
      name: 'eightPartCloudCover',
      label: '8-part cloud cover',
      symbol: null,
      code: 'A59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    electronicMailBox: {
      name: 'electronicMailBox',
      label: 'electronic mail box',
      symbol: null,
      code: 'EB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    electronvolt: {
      name: 'electronvolt',
      label: 'electronvolt',
      symbol: 'eV',
      code: 'A53',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.602176487 × 10⁻¹⁹ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'kineticEnergy',
        'betaDisintegrationEnergy',
        'resonanceEnergy',
        'potentialEnergy',
        'energy',
        'fermiEnergy',
        'maximumBetaParticleEnergy'
      ]
    },
    electronvoltPerMetre: {
      name: 'electronvoltPerMetre',
      label: 'electronvolt per metre',
      symbol: 'eV/m',
      code: 'A54',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerMetre'];
      },
      conversionFactor: '1.602176487 × 10⁻¹⁹ J/m',
      quantityKinds: ['totalLinearStoppingPower', 'linearEnergyTransfer', 'totalLinearStoppingPower', 'linearEnergyTransfer']
    },
    electronvoltSquareMetre: {
      name: 'electronvoltSquareMetre',
      label: 'electronvolt square metre',
      symbol: 'eV·m²',
      code: 'A55',
      referenceUnit: function () {
        return sammUDefinition.units['jouleSquareMetre'];
      },
      conversionFactor: '1.602176487 × 10⁻¹⁹ J × m²',
      quantityKinds: ['totalAtomicStoppingPower', 'totalAtomicStoppingPower']
    },
    electronvoltSquareMetrePerKilogram: {
      name: 'electronvoltSquareMetrePerKilogram',
      label: 'electronvolt square metre per kilogram',
      symbol: 'eV·m²/kg',
      code: 'A56',
      referenceUnit: function () {
        return sammUDefinition.units['jouleSquareMetrePerKilogram'];
      },
      conversionFactor: '1.602176487 × 10⁻¹⁹ J × m²/kg',
      quantityKinds: ['totalMassStoppingPower', 'totalMassStoppingPower']
    },
    equivalentGallon: {
      name: 'equivalentGallon',
      label: 'equivalent gallon',
      symbol: null,
      code: 'EQ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    erlang: {
      name: 'erlang',
      label: 'erlang',
      symbol: 'E',
      code: 'Q11',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    exabitPerSecond: {
      name: 'exabitPerSecond',
      label: 'exabit per second',
      symbol: 'Ebit/s',
      code: 'E58',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    exabyte: {
      name: 'exabyte',
      label: 'Exabyte',
      symbol: 'EB',
      code: null,
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '10¹⁸ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    exajoule: {
      name: 'exajoule',
      label: 'exajoule',
      symbol: 'EJ',
      code: 'A68',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10¹⁸ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'energy',
        'potentialEnergy',
        'kineticEnergy'
      ]
    },
    exbibitPerCubicMetre: {
      name: 'exbibitPerCubicMetre',
      label: 'exbibit per cubic metre',
      symbol: 'Eibit/m³',
      code: 'E67',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    exbibitPerMetre: {
      name: 'exbibitPerMetre',
      label: 'exbibit per metre',
      symbol: 'Eibit/m',
      code: 'E65',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    exbibitPerSquareMetre: {
      name: 'exbibitPerSquareMetre',
      label: 'exbibit per square metre',
      symbol: 'Eibit/m²',
      code: 'E66',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    exbibyte: {
      name: 'exbibyte',
      label: 'exbibyte',
      symbol: 'Eibyte',
      code: 'E59',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '2⁶⁰ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    failuresInTime: {
      name: 'failuresInTime',
      label: 'failures in time',
      symbol: 'FITTING_PROGRESS',
      code: 'FITTING_PROGRESS',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalSecond'];
      },
      conversionFactor: '2.77778 × 10⁻¹³ s⁻¹',
      quantityKinds: [
        'rotationalFrequency',
        'pulsatance',
        'larmorAngularFrequency',
        'angularFrequency',
        'circularFrequency',
        'decayConstant',
        'disintegrationConstant',
        'dampingCoefficient',
        'photonFlux',
        'debyeAngularFrequency'
      ]
    },
    farad: {
      name: 'farad',
      label: 'farad',
      symbol: 'F',
      code: 'FAR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['capacitance']
    },
    faradPerKilometre: {
      name: 'faradPerKilometre',
      label: 'farad per kilometre',
      symbol: 'F/km',
      code: 'H33',
      referenceUnit: function () {
        return sammUDefinition.units['faradPerMetre'];
      },
      conversionFactor: '10⁻³ F/m',
      quantityKinds: [
        'permittivity',
        'electricConstant',
        'permittivityOfVacuum',
        'permittivityOfVacuum',
        'permittivity',
        'electricConstant'
      ]
    },
    faradPerMetre: {
      name: 'faradPerMetre',
      label: 'farad per metre',
      symbol: 'F/m',
      code: 'A69',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['permittivityOfVacuum', 'permittivity', 'electricConstant']
    },
    fathom: {
      name: 'fathom',
      label: 'fathom',
      symbol: 'fth',
      code: 'AK',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '1.8288 m',
      quantityKinds: [
        'cartesianCoordinates',
        'distance',
        'radius',
        'radiusOfCurvature',
        'thickness',
        'length',
        'diameter',
        'height',
        'lengthOfPath',
        'breadth',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    femtojoule: {
      name: 'femtojoule',
      label: 'femtojoule',
      symbol: 'fJ',
      code: 'A70',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10⁻¹⁵ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'potentialEnergy',
        'kineticEnergy',
        'energy',
        'gapEnergy'
      ]
    },
    femtometre: {
      name: 'femtometre',
      label: 'femtometre',
      symbol: 'fm',
      code: 'A71',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁻¹⁵ m',
      quantityKinds: [
        'lengthOfPath',
        'length',
        'radius',
        'distance',
        'diameter',
        'thickness',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'breadth',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    fibreMetre: {
      name: 'fibreMetre',
      label: 'fibre metre',
      symbol: null,
      code: 'FBM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    fivePack: {
      name: 'fivePack',
      label: 'five pack',
      symbol: null,
      code: 'P5',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    fixedRate: {
      name: 'fixedRate',
      label: 'fixed rate',
      symbol: null,
      code: '1I',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    flakeTon: {
      name: 'flakeTon',
      label: 'flake ton',
      symbol: null,
      code: 'FL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    fluidOunceUk: {
      name: 'fluidOunceUk',
      label: 'fluid ounce (UK)',
      symbol: 'fl oz (UK)',
      code: 'OZI',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '2.841306 × 10⁻⁵ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    fluidOunceUs: {
      name: 'fluidOunceUs',
      label: 'fluid ounce (US)',
      symbol: 'fl oz (US)',
      code: 'OZA',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '2.957353 × 10⁻⁵ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    foot: {
      name: 'foot',
      label: 'foot',
      symbol: 'ft',
      code: 'FOT',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '0.3048 m',
      quantityKinds: [
        'radius',
        'cartesianCoordinates',
        'radiusOfCurvature',
        'length',
        'diameter',
        'distance',
        'height',
        'breadth',
        'thickness',
        'lengthOfPath',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    footOfWater392Degreesf: {
      name: 'footOfWater392Degreesf',
      label: 'foot of water (39.2 °F)',
      symbol: 'ftH₂O (39,2 °F)',
      code: 'N15',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '2.98898 × 10³ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'shearModulus',
        'bulkModulus',
        'pressure',
        'normalStress',
        'modulusOfCompression',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'shearStress'
      ]
    },
    footPerDegreeFahrenheit: {
      name: 'footPerDegreeFahrenheit',
      label: 'foot per degree Fahrenheit',
      symbol: 'ft/°F',
      code: 'K13',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerKelvin'];
      },
      conversionFactor: '0.54864 m/K',
      quantityKinds: [
        'length',
        'cartesianCoordinates',
        'radius',
        'thickness',
        'radiusOfCurvature',
        'height',
        'breadth',
        'diameter',
        'distance',
        'lengthOfPath',
        'distance',
        'diameter',
        'height',
        'thickness',
        'length',
        'cartesianCoordinates',
        'lengthOfPath',
        'radiusOfCurvature',
        'radius',
        'breadth'
      ]
    },
    footPerHour: {
      name: 'footPerHour',
      label: 'foot per hour',
      symbol: 'ft/h',
      code: 'K14',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '8.466667 × 10⁻⁵m/s',
      quantityKinds: [
        'groupVelocity',
        'velocity',
        'phaseVelocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    footPerMinute: {
      name: 'footPerMinute',
      label: 'foot per minute',
      symbol: 'ft/min',
      code: 'FR',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '5.08 × 10⁻³ m/s',
      quantityKinds: [
        'velocity',
        'groupVelocity',
        'phaseVelocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    footPerPsi: {
      name: 'footPerPsi',
      label: 'foot per psi',
      symbol: 'ft/psi',
      code: 'K17',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerPascal'];
      },
      conversionFactor: '4.420750 × 10⁻⁵ m/Pa',
      quantityKinds: [
        'lengthOfPath',
        'radiusOfCurvature',
        'distance',
        'radius',
        'thickness',
        'cartesianCoordinates',
        'diameter',
        'breadth',
        'length',
        'height',
        'diameter',
        'thickness',
        'radius',
        'height',
        'distance',
        'lengthOfPath',
        'radiusOfCurvature',
        'breadth',
        'length',
        'cartesianCoordinates'
      ]
    },
    footPerSecond: {
      name: 'footPerSecond',
      label: 'foot per second',
      symbol: 'ft/s',
      code: 'FS',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '0.3048 m/s',
      quantityKinds: [
        'phaseVelocity',
        'velocity',
        'groupVelocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    footPerSecondDegreeFahrenheit: {
      name: 'footPerSecondDegreeFahrenheit',
      label: 'foot per second degree Fahrenheit',
      symbol: '(ft/s)/°F',
      code: 'K18',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondKelvin'];
      },
      conversionFactor: '0.54864 (m/s)/K',
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity', 'phaseVelocity', 'velocity', 'groupVelocity']
    },
    footPerSecondPsi: {
      name: 'footPerSecondPsi',
      label: 'foot per second psi',
      symbol: '(ft/s)/psi',
      code: 'K19',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondPascal'];
      },
      conversionFactor: '4.420750 × 10⁻⁵ (m/s)/Pa',
      quantityKinds: ['phaseVelocity', 'velocity', 'groupVelocity', 'velocity', 'phaseVelocity', 'groupVelocity']
    },
    footPerSecondSquared: {
      name: 'footPerSecondSquared',
      label: 'foot per second squared',
      symbol: 'ft/s²',
      code: 'A73',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '0.3048 m/s²',
      quantityKinds: [
        'acceleration',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    footPerThousand: {
      name: 'footPerThousand',
      label: 'foot per thousand',
      symbol: null,
      code: 'E33',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '3.048 × 10⁻⁴ m',
      quantityKinds: [
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    footPoundForce: {
      name: 'footPoundForce',
      label: 'foot pound-force',
      symbol: 'ft·lbf',
      code: '85',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.355818 J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'energy',
        'potentialEnergy',
        'kineticEnergy'
      ]
    },
    footPoundForcePerHour: {
      name: 'footPoundForcePerHour',
      label: 'foot pound-force per hour',
      symbol: 'ft·lbf/h',
      code: 'K15',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '3.766161 × 10⁻⁴ W',
      quantityKinds: [
        'power',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    footPoundForcePerMinute: {
      name: 'footPoundForcePerMinute',
      label: 'foot pound-force per minute',
      symbol: 'ft·lbf/min',
      code: 'K16',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '2.259697 × 10⁻² W',
      quantityKinds: [
        'power',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    footPoundForcePerSecond: {
      name: 'footPoundForcePerSecond',
      label: 'foot pound-force per second',
      symbol: 'ft·lbf/s',
      code: 'A74',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '1.355818 W',
      quantityKinds: [
        'power',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    footPoundal: {
      name: 'footPoundal',
      label: 'foot poundal',
      symbol: 'ft·pdl',
      code: 'N46',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '4.214011 × 10⁻² J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'potentialEnergy',
        'work',
        'energy',
        'kineticEnergy'
      ]
    },
    footToTheFourthPower: {
      name: 'footToTheFourthPower',
      label: 'foot to the fourth power',
      symbol: 'ft⁴',
      code: 'N27',
      referenceUnit: function () {
        return sammUDefinition.units['metreToTheFourthPower'];
      },
      conversionFactor: '8.630975 × 10⁻³ m⁴',
      quantityKinds: ['secondMomentOfArea', 'secondAxialMomentOfArea', 'secondPolarMomentOfArea']
    },
    footUsSurvey: {
      name: 'footUsSurvey',
      label: 'foot (U.S. survey)',
      symbol: 'ft (US survey)',
      code: 'M51',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '3.048006 × 10⁻¹ m',
      quantityKinds: [
        'diameter',
        'radiusOfCurvature',
        'cartesianCoordinates',
        'radius',
        'height',
        'distance',
        'length',
        'thickness',
        'lengthOfPath',
        'breadth',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    footcandle: {
      name: 'footcandle',
      label: 'footcandle',
      symbol: 'ftc',
      code: 'P27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['illuminance']
    },
    footlambert: {
      name: 'footlambert',
      label: 'footlambert',
      symbol: 'ftL',
      code: 'P29',
      referenceUnit: function () {
        return sammUDefinition.units['candelaPerSquareMetre'];
      },
      conversionFactor: '3.426259 cd/m²',
      quantityKinds: ['luminance', 'luminance']
    },
    fortyFootContainer: {
      name: 'fortyFootContainer',
      label: 'forty foot container',
      symbol: null,
      code: '21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    franklin: {
      name: 'franklin',
      label: 'franklin',
      symbol: 'Fr',
      code: 'N94',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '3.335641 × 10⁻¹⁰ C',
      quantityKinds: [
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'quantityOfElectricity',
        'electricCharge',
        'electricFluxFluxOfDisplacement'
      ]
    },
    freightTon: {
      name: 'freightTon',
      label: 'freight ton',
      symbol: null,
      code: 'A75',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    frenchGauge: {
      name: 'frenchGauge',
      label: 'French gauge',
      symbol: 'Fg',
      code: 'H79',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '0.333333333 × 10⁻³ m',
      quantityKinds: [
        'height',
        'thickness',
        'length',
        'cartesianCoordinates',
        'lengthOfPath',
        'diameter',
        'radius',
        'radiusOfCurvature',
        'distance',
        'breadth',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    furlong: {
      name: 'furlong',
      label: 'furlong',
      symbol: 'fur',
      code: 'M50',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '2.01168 × 10² m',
      quantityKinds: [
        'breadth',
        'radius',
        'thickness',
        'distance',
        'length',
        'lengthOfPath',
        'diameter',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    gal: {
      name: 'gal',
      label: 'gal',
      symbol: 'Gal',
      code: 'A76',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '10⁻² m/s²',
      quantityKinds: [
        'acceleration',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    gallonUk: {
      name: 'gallonUk',
      label: 'gallon (UK)',
      symbol: 'gal (UK)',
      code: 'GLI',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '4.546092 × 10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    gallonUkPerDay: {
      name: 'gallonUkPerDay',
      label: 'gallon (UK) per day',
      symbol: 'gal (UK)/d',
      code: 'K26',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '5.261678 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    gallonUkPerHour: {
      name: 'gallonUkPerHour',
      label: 'gallon (UK) per hour',
      symbol: 'gal (UK)/h',
      code: 'K27',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.262803 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    gallonUkPerSecond: {
      name: 'gallonUkPerSecond',
      label: 'gallon (UK) per second',
      symbol: 'gal (UK)/s',
      code: 'K28',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.54609 × 10⁻³ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    gallonUs: {
      name: 'gallonUs',
      label: 'gallon (US)',
      symbol: 'gal (US)',
      code: 'GLL',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '3.785412 × 10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    gallonUsLiquidPerSecond: {
      name: 'gallonUsLiquidPerSecond',
      label: 'gallon (US liquid) per second',
      symbol: 'gal (US liq.)/s',
      code: 'K30',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.785412 × 10⁻³ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    gallonUsPerDay: {
      name: 'gallonUsPerDay',
      label: 'gallon (US) per day',
      symbol: 'gal (US)/d',
      code: 'GB',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.381264 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    gallonUsPerHour: {
      name: 'gallonUsPerHour',
      label: 'gallon (US) per hour',
      symbol: 'gal/h',
      code: 'G50',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    gamma: {
      name: 'gamma',
      label: 'gamma',
      symbol: 'γ',
      code: 'P12',
      referenceUnit: function () {
        return sammUDefinition.units['tesla'];
      },
      conversionFactor: '10⁻⁹ T',
      quantityKinds: [
        'magneticPolarization',
        'lowerCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticInduction',
        'thermodynamicCriticalMagneticFluxDensity',
        'upperCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticPolarization',
        'magneticInduction'
      ]
    },
    gibibit: {
      name: 'gibibit',
      label: 'gibibit',
      symbol: 'Gibit',
      code: 'B30',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gibibitPerCubicMetre: {
      name: 'gibibitPerCubicMetre',
      label: 'gibibit per cubic metre',
      symbol: 'Gibit/m³',
      code: 'E71',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gibibitPerMetre: {
      name: 'gibibitPerMetre',
      label: 'gibibit per metre',
      symbol: 'Gibit/m',
      code: 'E69',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gibibitPerSquareMetre: {
      name: 'gibibitPerSquareMetre',
      label: 'gibibit per square metre',
      symbol: 'Gibit/m²',
      code: 'E70',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gibibyte: {
      name: 'gibibyte',
      label: 'Gibibyte',
      symbol: 'GiB',
      code: 'E62',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '2³⁰ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    gigaabyte: {
      name: 'gigaabyte',
      label: 'Gigabyte',
      symbol: 'Gbyte',
      code: 'E34',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '10⁹ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    gigabecquerel: {
      name: 'gigabecquerel',
      label: 'gigabecquerel',
      symbol: 'GBq',
      code: 'GBQ',
      referenceUnit: function () {
        return sammUDefinition.units['becquerel'];
      },
      conversionFactor: '10⁹ Bq',
      quantityKinds: ['activity', 'activity']
    },
    gigabit: {
      name: 'gigabit',
      label: 'gigabit',
      symbol: 'Gbit',
      code: 'B68',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gigabitPerSecond: {
      name: 'gigabitPerSecond',
      label: 'gigabit per second',
      symbol: 'Gbit/s',
      code: 'B80',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gigabytePerSecond: {
      name: 'gigabytePerSecond',
      label: 'gigabyte per second',
      symbol: 'Gbyte/s',
      code: 'E68',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gigacoulombPerCubicMetre: {
      name: 'gigacoulombPerCubicMetre',
      label: 'gigacoulomb per cubic metre',
      symbol: 'GC/m³',
      code: 'A84',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerCubicMetre'];
      },
      conversionFactor: '10⁹ C/m³',
      quantityKinds: ['volumicCharge', 'volumeDensityOfCharge', 'chargeDensity', 'volumeDensityOfCharge', 'volumicCharge', 'chargeDensity']
    },
    gigaelectronvolt: {
      name: 'gigaelectronvolt',
      label: 'gigaelectronvolt',
      symbol: 'GeV',
      code: 'A85',
      referenceUnit: function () {
        return sammUDefinition.units['electronvolt'];
      },
      conversionFactor: '10⁹ eV',
      quantityKinds: [
        'kineticEnergy',
        'energy',
        'work',
        'potentialEnergy',
        'work',
        'kineticEnergy',
        'betaDisintegrationEnergy',
        'resonanceEnergy',
        'potentialEnergy',
        'energy',
        'fermiEnergy',
        'maximumBetaParticleEnergy'
      ]
    },
    gigahertz: {
      name: 'gigahertz',
      label: 'gigahertz',
      symbol: 'GHz',
      code: 'A86',
      referenceUnit: function () {
        return sammUDefinition.units['hertz'];
      },
      conversionFactor: '10⁹ Hz',
      quantityKinds: ['frequency', 'frequency']
    },
    gigahertzMetre: {
      name: 'gigahertzMetre',
      label: 'gigahertz metre',
      symbol: 'GHz·m',
      code: 'M18',
      referenceUnit: function () {
        return sammUDefinition.units['hertzMetre'];
      },
      conversionFactor: '10⁹ Hz × m',
      quantityKinds: ['performanceCharacteristic', 'coefficient', 'performanceCharacteristic', 'coefficient']
    },
    gigajoule: {
      name: 'gigajoule',
      label: 'gigajoule',
      symbol: 'GJ',
      code: 'GV',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10⁹ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'energy',
        'potentialEnergy',
        'kineticEnergy'
      ]
    },
    gigaohm: {
      name: 'gigaohm',
      label: 'gigaohm',
      symbol: 'GΩ',
      code: 'A87',
      referenceUnit: function () {
        return sammUDefinition.units['ohm'];
      },
      conversionFactor: '10⁹ Ω',
      quantityKinds: [
        'resistanceToAlternatingCurrent',
        'reactance',
        'modulusOfImpedance',
        'resistanceToDirectCurrent',
        'impedance',
        'complexImpedances',
        'modulusOfImpedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'impedance',
        'resistanceToDirectCurrent'
      ]
    },
    gigaohmMetre: {
      name: 'gigaohmMetre',
      label: 'gigaohm metre',
      symbol: 'GΩ·m',
      code: 'A88',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '10⁹ Ω × m',
      quantityKinds: ['resistivity', 'residualResistivity', 'resistivity']
    },
    gigaohmPerMetre: {
      name: 'gigaohmPerMetre',
      label: 'gigaohm per metre',
      symbol: 'GΩ/m',
      code: 'M26',
      referenceUnit: function () {
        return sammUDefinition.units['ohmPerMetre'];
      },
      conversionFactor: '10⁹ Ω/m',
      quantityKinds: ['lineicResistance', 'resistanceLoadPerUnitLength']
    },
    gigapascal: {
      name: 'gigapascal',
      label: 'gigapascal',
      symbol: 'GPa',
      code: 'A89',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁹ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'shearStress',
        'modulusOfRigidity',
        'modulusOfElasticity',
        'shearModulus',
        'normalStress',
        'pressure',
        'bulkModulus',
        'modulusOfCompression'
      ]
    },
    gigawatt: {
      name: 'gigawatt',
      label: 'gigawatt',
      symbol: 'GW',
      code: 'A90',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10⁹ W',
      quantityKinds: [
        'activePower',
        'power',
        'powerForDirectCurrent',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    gigawattHour: {
      name: 'gigawattHour',
      label: 'gigawatt hour',
      symbol: 'GW·h',
      code: 'GWH',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '3.6 × 10¹² J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'kineticEnergy',
        'work',
        'energy',
        'potentialEnergy'
      ]
    },
    gilbert: {
      name: 'gilbert',
      label: 'gilbert',
      symbol: 'Gi',
      code: 'N97',
      referenceUnit: function () {
        return sammUDefinition.units['ampere'];
      },
      conversionFactor: '7.957747 × 10⁻¹ A',
      quantityKinds: [
        'electricCurrent',
        'magnetomotiveForce',
        'currentLinkage',
        'magneticPotentialDifference',
        'magneticPotentialDifference',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent'
      ]
    },
    gillUk: {
      name: 'gillUk',
      label: 'gill (UK)',
      symbol: 'gi (UK)',
      code: 'GII',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.420653 × 10⁻⁴ m³',
      quantityKinds: ['volume', 'sectionModulus']
    },
    gillUkPerDay: {
      name: 'gillUkPerDay',
      label: 'gill (UK) per day',
      symbol: 'gi (UK)/d',
      code: 'K32',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.644274 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    gillUkPerHour: {
      name: 'gillUkPerHour',
      label: 'gill (UK) per hour',
      symbol: 'gi (UK)/h',
      code: 'K33',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.946258 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    gillUkPerMinute: {
      name: 'gillUkPerMinute',
      label: 'gill (UK) per minute',
      symbol: 'gi (UK)/min',
      code: 'K34',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '0.02367755 m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    gillUkPerSecond: {
      name: 'gillUkPerSecond',
      label: 'gill (UK) per second',
      symbol: 'gi (UK)/s',
      code: 'K35',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.420653 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    gillUs: {
      name: 'gillUs',
      label: 'gill (US)',
      symbol: 'gi (US)',
      code: 'GIA',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.182941 × 10⁻⁴ m³',
      quantityKinds: ['volume', 'sectionModulus']
    },
    gillUsPerDay: {
      name: 'gillUsPerDay',
      label: 'gill (US) per day',
      symbol: 'gi (US)/d',
      code: 'K36',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.369145 × 10⁻⁹ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    gillUsPerHour: {
      name: 'gillUsPerHour',
      label: 'gill (US) per hour',
      symbol: 'gi (US)/h',
      code: 'K37',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.285947 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    gillUsPerMinute: {
      name: 'gillUsPerMinute',
      label: 'gill (US) per minute',
      symbol: 'gi (US)/min',
      code: 'K38',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.971568 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    gillUsPerSecond: {
      name: 'gillUsPerSecond',
      label: 'gill (US) per second',
      symbol: 'gi (US)/s',
      code: 'K39',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.182941 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    gon: {
      name: 'gon',
      label: 'gon',
      symbol: 'gon',
      code: 'A91',
      referenceUnit: function () {
        return sammUDefinition.units['rad'];
      },
      conversionFactor: '1.570796 × 10⁻² rad',
      quantityKinds: ['absorbedDose', 'anglePlane']
    },
    grain: {
      name: 'grain',
      label: 'grain',
      symbol: 'gr',
      code: 'GRN',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '64.79891 × 10⁻⁶ kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    grainPerGallonUs: {
      name: 'grainPerGallonUs',
      label: 'grain per gallon (US)',
      symbol: 'gr/gal (US)',
      code: 'K41',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '1.711806 × 10⁻² kg/m³',
      quantityKinds: [
        'massDensity',
        'volumicMass',
        'density',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    gram: {
      name: 'gram',
      label: 'gram',
      symbol: 'g',
      code: 'GRM',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10⁻³ kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    gramCentimetrePerSecond: {
      name: 'gramCentimetrePerSecond',
      label: 'gram centimetre per second',
      symbol: 'g·(cm/s)',
      code: 'M99',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetrePerSecond'];
      },
      conversionFactor: '10⁻⁵ kg × m/s',
      quantityKinds: ['momentum', 'momentum']
    },
    gramDryWeight: {
      name: 'gramDryWeight',
      label: 'gram, dry weight',
      symbol: null,
      code: 'GDW',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gramForcePerSquareCentimetre: {
      name: 'gramForcePerSquareCentimetre',
      label: 'gram-force per square centimetre',
      symbol: 'gf/cm²',
      code: 'K31',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '98.0665 Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'shearStress',
        'modulusOfCompression',
        'modulusOfElasticity',
        'shearModulus',
        'bulkModulus',
        'modulusOfRigidity',
        'normalStress',
        'pressure'
      ]
    },
    gramIncludingContainer: {
      name: 'gramIncludingContainer',
      label: 'gram, including container',
      symbol: null,
      code: 'GIC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gramIncludingInnerPackaging: {
      name: 'gramIncludingInnerPackaging',
      label: 'gram, including inner packaging',
      symbol: null,
      code: 'GIP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gramMillimetre: {
      name: 'gramMillimetre',
      label: 'gram millimetre',
      symbol: 'g·mm',
      code: 'H84',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetre'];
      },
      conversionFactor: '10⁻⁶ kg × m',
      quantityKinds: [
        'torque',
        'momentOfForce',
        'momentOfACouple',
        'radiusOfCurvature',
        'radius',
        'breadth',
        'distance',
        'length',
        'thickness',
        'cartesianCoordinates',
        'lengthOfPath',
        'diameter',
        'height'
      ]
    },
    gramOfFissileIsotope: {
      name: 'gramOfFissileIsotope',
      label: 'gram of fissile isotope',
      symbol: 'gi F/S',
      code: 'GFI',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gramPerBar: {
      name: 'gramPerBar',
      label: 'gram per bar',
      symbol: 'g/bar',
      code: 'F74',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerCentimetreSecond: {
      name: 'gramPerCentimetreSecond',
      label: 'gram per centimetre second',
      symbol: 'g/(cm·s)',
      code: 'N41',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '0.1 Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    gramPerCubicCentimetre: {
      name: 'gramPerCubicCentimetre',
      label: 'gram per cubic centimetre',
      symbol: 'g/cm³',
      code: '23',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10³ kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'volumicMass',
        'massDensity',
        'density'
      ]
    },
    gramPerCubicCentimetreBar: {
      name: 'gramPerCubicCentimetreBar',
      label: 'gram per cubic centimetre bar',
      symbol: 'g/(cm³·bar)',
      code: 'G11',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerCubicCentimetreKelvin: {
      name: 'gramPerCubicCentimetreKelvin',
      label: 'gram per cubic centimetre kelvin',
      symbol: 'g/(cm³·K)',
      code: 'G33',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerCubicDecimetre: {
      name: 'gramPerCubicDecimetre',
      label: 'gram per cubic decimetre',
      symbol: 'g/dm³',
      code: 'F23',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerCubicDecimetreBar: {
      name: 'gramPerCubicDecimetreBar',
      label: 'gram per cubic decimetre bar',
      symbol: 'g/(dm³·bar)',
      code: 'G12',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerCubicDecimetreKelvin: {
      name: 'gramPerCubicDecimetreKelvin',
      label: 'gram per cubic decimetre kelvin',
      symbol: 'g/(dm³·K)',
      code: 'G34',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerCubicMetre: {
      name: 'gramPerCubicMetre',
      label: 'gram per cubic metre',
      symbol: 'g/m³',
      code: 'A93',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10⁻³ kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'volumicMass',
        'massDensity',
        'density'
      ]
    },
    gramPerCubicMetreBar: {
      name: 'gramPerCubicMetreBar',
      label: 'gram per cubic metre bar',
      symbol: 'g/(m³·bar)',
      code: 'G14',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerCubicMetreKelvin: {
      name: 'gramPerCubicMetreKelvin',
      label: 'gram per cubic metre kelvin',
      symbol: 'g/(m³·K)',
      code: 'G36',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerDay: {
      name: 'gramPerDay',
      label: 'gram per day',
      symbol: 'g/d',
      code: 'F26',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerDayBar: {
      name: 'gramPerDayBar',
      label: 'gram per day bar',
      symbol: 'g/(d·bar)',
      code: 'F62',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerDayKelvin: {
      name: 'gramPerDayKelvin',
      label: 'gram per day kelvin',
      symbol: 'g/(d·K)',
      code: 'F35',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerHertz: {
      name: 'gramPerHertz',
      label: 'gram per hertz',
      symbol: 'g/Hz',
      code: 'F25',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerHour: {
      name: 'gramPerHour',
      label: 'gram per hour',
      symbol: 'g/h',
      code: 'F27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerHourBar: {
      name: 'gramPerHourBar',
      label: 'gram per hour bar',
      symbol: 'g/(h·bar)',
      code: 'F63',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerHourKelvin: {
      name: 'gramPerHourKelvin',
      label: 'gram per hour kelvin',
      symbol: 'g/(h·K)',
      code: 'F36',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerKelvin: {
      name: 'gramPerKelvin',
      label: 'gram per kelvin',
      symbol: 'g/K',
      code: 'F14',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerLitre: {
      name: 'gramPerLitre',
      label: 'gram per litre',
      symbol: 'g/l',
      code: 'GL',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: 'kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'volumicMass',
        'massDensity',
        'density'
      ]
    },
    gramPerLitreBar: {
      name: 'gramPerLitreBar',
      label: 'gram per litre bar',
      symbol: 'g/(l·bar)',
      code: 'G13',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerLitreKelvin: {
      name: 'gramPerLitreKelvin',
      label: 'gram per litre kelvin',
      symbol: 'g/(l·K)',
      code: 'G35',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerMetreGramPer100Centimetres: {
      name: 'gramPerMetreGramPer100Centimetres',
      label: 'gram per metre (gram per 100 centimetres)',
      symbol: 'g/m',
      code: 'GF',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '10⁻³ kg/m',
      quantityKinds: ['linearMass', 'linearDensity', 'linearMass', 'linearDensity']
    },
    gramPerMillilitre: {
      name: 'gramPerMillilitre',
      label: 'gram per millilitre',
      symbol: 'g/ml',
      code: 'GJ',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10³ kg/m³',
      quantityKinds: [
        'volumicMass',
        'density',
        'massDensity',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    gramPerMillilitreBar: {
      name: 'gramPerMillilitreBar',
      label: 'gram per millilitre bar',
      symbol: 'g/(ml·bar)',
      code: 'G15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerMillilitreKelvin: {
      name: 'gramPerMillilitreKelvin',
      label: 'gram per millilitre kelvin',
      symbol: 'g/(ml·K)',
      code: 'G37',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    gramPerMillimetre: {
      name: 'gramPerMillimetre',
      label: 'gram per millimetre',
      symbol: 'g/mm',
      code: 'H76',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['linearMass', 'linearDensity']
    },
    gramPerMinute: {
      name: 'gramPerMinute',
      label: 'gram per minute',
      symbol: 'g/min',
      code: 'F28',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerMinuteBar: {
      name: 'gramPerMinuteBar',
      label: 'gram per minute bar',
      symbol: 'g/(min·bar)',
      code: 'F64',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerMinuteKelvin: {
      name: 'gramPerMinuteKelvin',
      label: 'gram per minute kelvin',
      symbol: 'g/(min·K)',
      code: 'F37',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerMole: {
      name: 'gramPerMole',
      label: 'gram per mole',
      symbol: 'g/mol',
      code: 'A94',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMole'];
      },
      conversionFactor: '10⁻³ kg/mol',
      quantityKinds: ['molarMass', 'molarMass']
    },
    gramPerSecond: {
      name: 'gramPerSecond',
      label: 'gram per second',
      symbol: 'g/s',
      code: 'F29',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerSecondBar: {
      name: 'gramPerSecondBar',
      label: 'gram per second bar',
      symbol: 'g/(s·bar)',
      code: 'F65',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerSecondKelvin: {
      name: 'gramPerSecondKelvin',
      label: 'gram per second kelvin',
      symbol: 'g/(s·K)',
      code: 'F38',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    gramPerSquareCentimetre: {
      name: 'gramPerSquareCentimetre',
      label: 'gram per square centimetre',
      symbol: 'g/cm²',
      code: '25',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '10 kg/m²',
      quantityKinds: ['surfaceDensity', 'areicMass', 'surfaceDensity', 'meanMassRange', 'areicMass']
    },
    gramPerSquareMetre: {
      name: 'gramPerSquareMetre',
      label: 'gram per square metre',
      symbol: 'g/m²',
      code: 'GM',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '10⁻³ kg/m²',
      quantityKinds: ['surfaceDensity', 'areicMass', 'surfaceDensity', 'meanMassRange', 'areicMass']
    },
    gramPerSquareMillimetre: {
      name: 'gramPerSquareMillimetre',
      label: 'gram per square millimetre',
      symbol: 'g/mm²',
      code: 'N24',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '10³ kg/m²',
      quantityKinds: [
        'modulusOfElasticity',
        'shearModulus',
        'modulusOfCompression',
        'modulusOfRigidity',
        'bulkModulus',
        'pressure',
        'normalStress',
        'shearStress',
        'surfaceDensity',
        'meanMassRange',
        'areicMass'
      ]
    },
    gray: {
      name: 'gray',
      label: 'gray',
      symbol: 'Gy',
      code: 'A95',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificEnergyImparted', 'massicEnergyImparted']
    },
    grayPerHour: {
      name: 'grayPerHour',
      label: 'gray per hour',
      symbol: 'Gy/h',
      code: 'P61',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    grayPerMinute: {
      name: 'grayPerMinute',
      label: 'gray per minute',
      symbol: 'Gy/min',
      code: 'P57',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '1.66667 × 10⁻² Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    grayPerSecond: {
      name: 'grayPerSecond',
      label: 'gray per second',
      symbol: 'Gy/s',
      code: 'A96',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['absorbedDoseRate']
    },
    greatGross: {
      name: 'greatGross',
      label: 'great gross',
      symbol: null,
      code: 'GGR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    gross: {
      name: 'gross',
      label: 'gross',
      symbol: 'gr',
      code: 'GRO',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    grossKilogram: {
      name: 'grossKilogram',
      label: 'gross kilogram',
      symbol: null,
      code: 'E4',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    group: {
      name: 'group',
      label: 'group',
      symbol: null,
      code: '10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    guntersChain: {
      name: 'guntersChain',
      label: "Gunter's chain",
      symbol: 'ch (UK)',
      code: 'X1',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '20.1168 m',
      quantityKinds: [
        'height',
        'length',
        'cartesianCoordinates',
        'breadth',
        'distance',
        'radiusOfCurvature',
        'radius',
        'lengthOfPath',
        'diameter',
        'thickness',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    halfYear6Months: {
      name: 'halfYear6Months',
      label: 'half year (6 months)',
      symbol: null,
      code: 'SAN',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hangingContainer: {
      name: 'hangingContainer',
      label: 'hanging container',
      symbol: null,
      code: 'Z11',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hank: {
      name: 'hank',
      label: 'hank',
      symbol: null,
      code: 'HA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hartley: {
      name: 'hartley',
      label: 'hartley',
      symbol: 'Hart',
      code: 'Q15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hartleyPerSecond: {
      name: 'hartleyPerSecond',
      label: 'hartley per second',
      symbol: 'Hart/s',
      code: 'Q18',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    head: {
      name: 'head',
      label: 'head',
      symbol: null,
      code: 'HEA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hectobar: {
      name: 'hectobar',
      label: 'hectobar',
      symbol: 'hbar',
      code: 'HBA',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁷ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'shearStress',
        'modulusOfElasticity',
        'pressure',
        'modulusOfRigidity',
        'normalStress',
        'modulusOfCompression',
        'bulkModulus',
        'shearModulus'
      ]
    },
    hectogram: {
      name: 'hectogram',
      label: 'hectogram',
      symbol: 'hg',
      code: 'HGM',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10⁻¹ kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass', 'mass']
    },
    hectolitre: {
      name: 'hectolitre',
      label: 'hectolitre',
      symbol: 'hl',
      code: 'HLT',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻¹ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    hectolitreOfPureAlcohol: {
      name: 'hectolitreOfPureAlcohol',
      label: 'hectolitre of pure alcohol',
      symbol: null,
      code: 'HPA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hectometre: {
      name: 'hectometre',
      label: 'hectometre',
      symbol: 'hm',
      code: 'HMT',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10² m',
      quantityKinds: [
        'distance',
        'length',
        'thickness',
        'diameter',
        'radius',
        'breadth',
        'height',
        'cartesianCoordinates',
        'lengthOfPath',
        'radiusOfCurvature',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    hectopascal: {
      name: 'hectopascal',
      label: 'hectopascal',
      symbol: 'hPa',
      code: 'A97',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10² Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'normalStress',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'modulusOfCompression',
        'bulkModulus',
        'shearModulus',
        'pressure',
        'shearStress'
      ]
    },
    hectopascalCubicMetrePerSecond: {
      name: 'hectopascalCubicMetrePerSecond',
      label: 'hectopascal cubic metre per second',
      symbol: 'hPa·m³/s',
      code: 'F94',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'modulusOfElasticity',
        'modulusOfCompression',
        'modulusOfRigidity',
        'shearStress',
        'normalStress',
        'shearModulus'
      ]
    },
    hectopascalLitrePerSecond: {
      name: 'hectopascalLitrePerSecond',
      label: 'hectopascal litre per second',
      symbol: 'hPa·l/s',
      code: 'F93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'bulkModulus',
        'modulusOfCompression',
        'shearStress',
        'modulusOfElasticity',
        'normalStress',
        'modulusOfRigidity',
        'shearModulus',
        'pressure'
      ]
    },
    hectopascalPerBar: {
      name: 'hectopascalPerBar',
      label: 'hectopascal per bar',
      symbol: 'hPa/bar',
      code: 'E99',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureRatio']
    },
    hectopascalPerKelvin: {
      name: 'hectopascalPerKelvin',
      label: 'hectopascal per kelvin',
      symbol: 'hPa/K',
      code: 'F82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'bulkModulus',
        'normalStress',
        'modulusOfElasticity',
        'modulusOfCompression',
        'pressure',
        'shearModulus',
        'modulusOfRigidity',
        'shearStress'
      ]
    },
    hectopascalPerMetre: {
      name: 'hectopascalPerMetre',
      label: 'hectopascal per metre',
      symbol: 'hPa/m',
      code: 'P82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    hefnerKerze: {
      name: 'hefnerKerze',
      label: 'Hefner-Kerze',
      symbol: 'HK',
      code: 'P35',
      referenceUnit: function () {
        return sammUDefinition.units['candela'];
      },
      conversionFactor: '0.903 cd',
      quantityKinds: ['luminousIntensity', 'luminousIntensity']
    },
    henry: {
      name: 'henry',
      label: 'henry',
      symbol: 'H',
      code: '81',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['selfInductance', 'permeance', 'mutualInductance']
    },
    henryPerKiloohm: {
      name: 'henryPerKiloohm',
      label: 'henry per kiloohm',
      symbol: 'H/kΩ',
      code: 'H03',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻³ s',
      quantityKinds: [
        'selfInductance',
        'mutualInductance',
        'permeance',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    henryPerMetre: {
      name: 'henryPerMetre',
      label: 'henry per metre',
      symbol: 'H/m',
      code: 'A98',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['permeabilityOfVacuum', 'permeability', 'magneticConstant']
    },
    henryPerOhm: {
      name: 'henryPerOhm',
      label: 'henry per ohm',
      symbol: 'H/Ω',
      code: 'H04',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: 's',
      quantityKinds: [
        'mutualInductance',
        'permeance',
        'selfInductance',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    hertz: {
      name: 'hertz',
      label: 'hertz',
      symbol: 'Hz',
      code: 'HTZ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['frequency']
    },
    hertzMetre: {
      name: 'hertzMetre',
      label: 'hertz metre',
      symbol: 'Hz·m',
      code: 'H34',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['performanceCharacteristic', 'coefficient']
    },
    horsepowerBoiler: {
      name: 'horsepowerBoiler',
      label: 'horsepower (boiler)',
      symbol: 'boiler hp',
      code: 'K42',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '9.80950 × 10³ W',
      quantityKinds: [
        'power',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    horsepowerElectric: {
      name: 'horsepowerElectric',
      label: 'horsepower (electric)',
      symbol: 'electric hp',
      code: 'K43',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '746 W',
      quantityKinds: [
        'powerForDirectCurrent',
        'activePower',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    hour: {
      name: 'hour',
      label: 'hour',
      symbol: 'h',
      code: 'HUR',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '3600 s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'time'
      ]
    },
    hundred: {
      name: 'hundred',
      label: 'hundred',
      symbol: null,
      code: 'CEN',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredBoardFoot: {
      name: 'hundredBoardFoot',
      label: 'hundred board foot',
      symbol: null,
      code: 'BP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredBoxes: {
      name: 'hundredBoxes',
      label: 'hundred boxes',
      symbol: null,
      code: 'HBX',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredCount: {
      name: 'hundredCount',
      label: 'hundred count',
      symbol: null,
      code: 'HC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredCubicFoot: {
      name: 'hundredCubicFoot',
      label: 'hundred cubic foot',
      symbol: null,
      code: 'HH',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredCubicMetre: {
      name: 'hundredCubicMetre',
      label: 'hundred cubic metre',
      symbol: null,
      code: 'FF',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredInternationalUnit: {
      name: 'hundredInternationalUnit',
      label: 'hundred international unit',
      symbol: null,
      code: 'HIU',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredKilogramDryWeight: {
      name: 'hundredKilogramDryWeight',
      label: 'hundred kilogram, dry weight',
      symbol: null,
      code: 'HDW',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredKilogramNetMass: {
      name: 'hundredKilogramNetMass',
      label: 'hundred kilogram, net mass',
      symbol: null,
      code: 'HKM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredLeave: {
      name: 'hundredLeave',
      label: 'hundred leave',
      symbol: null,
      code: 'CLF',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredMetre: {
      name: 'hundredMetre',
      label: 'hundred metre',
      symbol: null,
      code: 'JPS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredPack: {
      name: 'hundredPack',
      label: 'hundred pack',
      symbol: null,
      code: 'CNP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    hundredPoundCwtOrHundredWeightUs: {
      name: 'hundredPoundCwtOrHundredWeightUs',
      label: 'hundred pound (cwt) / hundred weight (US)',
      symbol: 'cwt (US)',
      code: 'CWA',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '45.3592 kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    hundredWeightUk: {
      name: 'hundredWeightUk',
      label: 'hundred weight (UK)',
      symbol: 'cwt (UK)',
      code: 'CWI',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '50.80235 kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    hydraulicHorsePower: {
      name: 'hydraulicHorsePower',
      label: 'hydraulic horse power',
      symbol: null,
      code: '5J',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    imperialGallonPerMinute: {
      name: 'imperialGallonPerMinute',
      label: 'Imperial gallon per minute',
      symbol: 'gal (UK) /min',
      code: 'G3',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '7.57682 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    inch: {
      name: 'inch',
      label: 'inch',
      symbol: 'in',
      code: 'INH',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '25.4 × 10⁻³ m',
      quantityKinds: [
        'height',
        'diameter',
        'length',
        'breadth',
        'thickness',
        'cartesianCoordinates',
        'distance',
        'radius',
        'radiusOfCurvature',
        'lengthOfPath',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    inchOfMercury: {
      name: 'inchOfMercury',
      label: 'inch of mercury',
      symbol: 'inHg',
      code: 'F79',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'modulusOfRigidity',
        'modulusOfElasticity',
        'normalStress',
        'modulusOfCompression',
        'bulkModulus',
        'pressure',
        'shearStress',
        'shearModulus'
      ]
    },
    inchOfMercury32Degreesf: {
      name: 'inchOfMercury32Degreesf',
      label: 'inch of mercury (32 °F)',
      symbol: 'inHG (32 °F)',
      code: 'N16',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '3.38638 × 10³ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'bulkModulus',
        'shearStress',
        'modulusOfCompression',
        'normalStress',
        'modulusOfElasticity',
        'shearModulus',
        'pressure',
        'modulusOfRigidity'
      ]
    },
    inchOfMercury60Degreesf: {
      name: 'inchOfMercury60Degreesf',
      label: 'inch of mercury (60 °F)',
      symbol: 'inHg (60 °F)',
      code: 'N17',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '3.37685 × 10³ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'shearModulus',
        'normalStress',
        'bulkModulus',
        'modulusOfCompression',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'pressure',
        'shearStress'
      ]
    },
    inchOfWater: {
      name: 'inchOfWater',
      label: 'inch of water',
      symbol: 'inH₂O',
      code: 'F78',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'shearModulus',
        'modulusOfRigidity',
        'pressure',
        'normalStress',
        'modulusOfElasticity',
        'shearStress',
        'bulkModulus',
        'modulusOfCompression'
      ]
    },
    inchOfWater392Degreesf: {
      name: 'inchOfWater392Degreesf',
      label: 'inch of water (39.2 °F)',
      symbol: 'inH₂O (39,2 °F)',
      code: 'N18',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '2.49082 × 10² Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfCompression',
        'normalStress',
        'shearModulus',
        'bulkModulus',
        'modulusOfRigidity',
        'shearStress',
        'modulusOfElasticity',
        'pressure'
      ]
    },
    inchOfWater60Degreesf: {
      name: 'inchOfWater60Degreesf',
      label: 'inch of water (60 °F)',
      symbol: 'inH₂O (60 °F)',
      code: 'N19',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '2.4884 × 10² Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfElasticity',
        'shearModulus',
        'modulusOfCompression',
        'bulkModulus',
        'modulusOfRigidity',
        'pressure',
        'shearStress',
        'normalStress'
      ]
    },
    inchPerDegreeFahrenheit: {
      name: 'inchPerDegreeFahrenheit',
      label: 'inch per degree Fahrenheit',
      symbol: 'in/°F',
      code: 'K45',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerKelvin'];
      },
      conversionFactor: '4.572 × 10⁻² m/K',
      quantityKinds: [
        'radius',
        'height',
        'distance',
        'cartesianCoordinates',
        'diameter',
        'breadth',
        'lengthOfPath',
        'radiusOfCurvature',
        'thickness',
        'length',
        'distance',
        'diameter',
        'height',
        'thickness',
        'length',
        'cartesianCoordinates',
        'lengthOfPath',
        'radiusOfCurvature',
        'radius',
        'breadth'
      ]
    },
    inchPerLinearFoot: {
      name: 'inchPerLinearFoot',
      label: 'inch per linear foot',
      symbol: null,
      code: 'B82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    inchPerMinute: {
      name: 'inchPerMinute',
      label: 'inch per minute',
      symbol: 'in/min',
      code: 'M63',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '4.233333 × 10⁻⁴ m/s',
      quantityKinds: [
        'groupVelocity',
        'phaseVelocity',
        'velocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    inchPerPsi: {
      name: 'inchPerPsi',
      label: 'inch per psi',
      symbol: 'in/psi',
      code: 'K46',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerPascal'];
      },
      conversionFactor: '3.683959 × 10⁻⁶ m/Pa',
      quantityKinds: [
        'lengthOfPath',
        'radiusOfCurvature',
        'distance',
        'radius',
        'thickness',
        'cartesianCoordinates',
        'diameter',
        'breadth',
        'length',
        'height',
        'breadth',
        'length',
        'height',
        'thickness',
        'diameter',
        'radiusOfCurvature',
        'cartesianCoordinates',
        'radius',
        'lengthOfPath',
        'distance'
      ]
    },
    inchPerSecond: {
      name: 'inchPerSecond',
      label: 'inch per second',
      symbol: 'in/s',
      code: 'IU',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '0.0254 m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'velocity',
        'phaseVelocity',
        'groupVelocity'
      ]
    },
    inchPerSecondDegreeFahrenheit: {
      name: 'inchPerSecondDegreeFahrenheit',
      label: 'inch per second degree Fahrenheit',
      symbol: '(in/s)/°F',
      code: 'K47',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondKelvin'];
      },
      conversionFactor: '4.572 × 10⁻² (m/s)/K',
      quantityKinds: ['phaseVelocity', 'velocity', 'groupVelocity', 'velocity', 'phaseVelocity', 'groupVelocity']
    },
    inchPerSecondPsi: {
      name: 'inchPerSecondPsi',
      label: 'inch per second psi',
      symbol: '(in/s)/psi',
      code: 'K48',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondPascal'];
      },
      conversionFactor: '3.683959 × 10⁻⁶ (m/s)/Pa',
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity', 'phaseVelocity', 'groupVelocity', 'velocity']
    },
    inchPerSecondSquared: {
      name: 'inchPerSecondSquared',
      label: 'inch per second squared',
      symbol: 'in/s²',
      code: 'IV',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '0.0254 m/s²',
      quantityKinds: [
        'accelerationDueToGravity',
        'acceleration',
        'accelerationOfFreeFall',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    inchPerTwoPiRadiant: {
      name: 'inchPerTwoPiRadiant',
      label: 'inch per two pi radiant',
      symbol: 'in/revolution',
      code: 'H57',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['solidAngle']
    },
    inchPerYear: {
      name: 'inchPerYear',
      label: 'inch per year',
      symbol: 'in/y',
      code: 'M61',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '8.048774 × 10⁻¹⁰ m/s',
      quantityKinds: [
        'phaseVelocity',
        'groupVelocity',
        'velocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    inchPoundPoundInch: {
      name: 'inchPoundPoundInch',
      label: 'inch pound (pound inch)',
      symbol: 'in·lb',
      code: 'IA',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetre'];
      },
      conversionFactor: '1.15212 × 10⁻² kg × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple', 'momentOfACouple', 'torque', 'momentOfForce']
    },
    inchPoundal: {
      name: 'inchPoundal',
      label: 'inch poundal',
      symbol: 'in·pdl',
      code: 'N47',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '3.511677 × 10⁻³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'potentialEnergy',
        'work',
        'energy',
        'kineticEnergy'
      ]
    },
    inchToTheFourthPower: {
      name: 'inchToTheFourthPower',
      label: 'inch to the fourth power',
      symbol: 'in⁴',
      code: 'D69',
      referenceUnit: function () {
        return sammUDefinition.units['metreToTheFourthPower'];
      },
      conversionFactor: '41.62314 × 10⁻⁸ m⁴',
      quantityKinds: ['secondMomentOfArea', 'secondAxialMomentOfArea', 'secondPolarMomentOfArea']
    },
    internationalCandle: {
      name: 'internationalCandle',
      label: 'international candle',
      symbol: 'IK',
      code: 'P36',
      referenceUnit: function () {
        return sammUDefinition.units['candela'];
      },
      conversionFactor: '1.019 cd',
      quantityKinds: ['luminousIntensity', 'luminousIntensity']
    },
    internationalSugarDegree: {
      name: 'internationalSugarDegree',
      label: 'international sugar degree',
      symbol: null,
      code: 'ISD',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    job: {
      name: 'job',
      label: 'job',
      symbol: null,
      code: 'E51',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    joule: {
      name: 'joule',
      label: 'joule',
      symbol: 'J',
      code: 'JOU',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy'
      ]
    },
    joulePerCubicMetre: {
      name: 'joulePerCubicMetre',
      label: 'joule per cubic metre',
      symbol: 'J/m³',
      code: 'B8',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'electromagneticEnergyDensity',
        'volumicElectromagneticEnergy',
        'soundEnergy',
        'soundEnergyDensity',
        'volumic',
        'radiantEnergyDensity'
      ]
    },
    joulePerDay: {
      name: 'joulePerDay',
      label: 'joule per day',
      symbol: 'J/d',
      code: 'P17',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '1.15741 × 10⁻⁵ W',
      quantityKinds: [
        'activePower',
        'powerForDirectCurrent',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    joulePerGram: {
      name: 'joulePerGram',
      label: 'joule per gram',
      symbol: 'J/g',
      code: 'D95',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massicThermodynamicEnergy']
    },
    joulePerHour: {
      name: 'joulePerHour',
      label: 'joule per hour',
      symbol: 'J/h',
      code: 'P16',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ W',
      quantityKinds: [
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower',
        'powerForDirectCurrent',
        'activePower'
      ]
    },
    joulePerKelvin: {
      name: 'joulePerKelvin',
      label: 'joule per kelvin',
      symbol: 'J/K',
      code: 'JE',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['boltzmannConstant', 'entropy', 'massieuFunction', 'heatCapacity', 'planckFunction']
    },
    joulePerKilogram: {
      name: 'joulePerKilogram',
      label: 'joule per kilogram',
      symbol: 'J/kg',
      code: 'J2',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificEnergy', 'massicEnergy']
    },
    joulePerKilogramKelvin: {
      name: 'joulePerKilogramKelvin',
      label: 'joule per kilogram kelvin',
      symbol: 'J/(kg·K)',
      code: 'B11',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificHeatCapacityAtSaturation', 'specificHeatCapacityAtConstantVolume', 'specificHeatCapacityAtConstantPressure']
    },
    joulePerMetre: {
      name: 'joulePerMetre',
      label: 'joule per metre',
      symbol: 'J/m',
      code: 'B12',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['totalLinearStoppingPower', 'linearEnergyTransfer']
    },
    joulePerMetreToTheFourthPower: {
      name: 'joulePerMetreToTheFourthPower',
      label: 'joule per metre to the fourth power',
      symbol: 'J/m⁴',
      code: 'B14',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['spectralRadiantEnergyDensityInTermsOfWaveLength', 'spectralConcentrationOfRadiantEnergyDensityInTermsOfWavelength']
    },
    joulePerMinute: {
      name: 'joulePerMinute',
      label: 'joule per minute',
      symbol: 'J/min',
      code: 'P15',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '1.66667 × 10⁻² W',
      quantityKinds: [
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower',
        'activePower',
        'powerForDirectCurrent'
      ]
    },
    joulePerMole: {
      name: 'joulePerMole',
      label: 'joule per mole',
      symbol: 'J/mol',
      code: 'B15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['molarThermodynamicEnergy', 'chemicalPotential', 'affinityOfAChemicalReaction']
    },
    joulePerMoleKelvin: {
      name: 'joulePerMoleKelvin',
      label: 'joule per mole kelvin',
      symbol: 'J/(mol·K)',
      code: 'B16',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['molarHeatCapacity', 'molarGasConstant', 'molarEntropy']
    },
    joulePerSecond: {
      name: 'joulePerSecond',
      label: 'joule per second',
      symbol: 'J/s',
      code: 'P14',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: 'W',
      quantityKinds: [
        'powerForDirectCurrent',
        'activePower',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    joulePerSquareCentimetre: {
      name: 'joulePerSquareCentimetre',
      label: 'joule per square centimetre',
      symbol: 'J/cm²',
      code: 'E43',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerSquareMetre'];
      },
      conversionFactor: '10⁴ J/m²',
      quantityKinds: ['radianceExposure', 'radiantEnergyFluence', 'radiantEnergyFluence', 'radianceExposure', 'energyFluence']
    },
    joulePerSquareMetre: {
      name: 'joulePerSquareMetre',
      label: 'joule per square metre',
      symbol: 'J/m²',
      code: 'B13',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['radiantEnergyFluence', 'radianceExposure', 'energyFluence']
    },
    joulePerTesla: {
      name: 'joulePerTesla',
      label: 'joule per tesla',
      symbol: 'J/T',
      code: 'Q10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    jouleSecond: {
      name: 'jouleSecond',
      label: 'joule second',
      symbol: 'J·s',
      code: 'B18',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['planckConstant']
    },
    jouleSquareMetre: {
      name: 'jouleSquareMetre',
      label: 'joule square metre',
      symbol: 'J·m²',
      code: 'D73',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['totalAtomicStoppingPower']
    },
    jouleSquareMetrePerKilogram: {
      name: 'jouleSquareMetrePerKilogram',
      label: 'joule square metre per kilogram',
      symbol: 'J·m²/kg',
      code: 'B20',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['totalMassStoppingPower']
    },
    katal: {
      name: 'katal',
      label: 'katal',
      symbol: 'kat',
      code: 'KAT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['catalyticActivity']
    },
    kelvin: {
      name: 'kelvin',
      label: 'kelvin',
      symbol: 'K',
      code: 'KEL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'fermiTemperature',
        'debyeTemperature',
        'thermodynamic',
        'superConductorTransitionTemperature',
        'neelTemperature',
        'curieTemperature'
      ]
    },
    kelvinMetrePerWatt: {
      name: 'kelvinMetrePerWatt',
      label: 'kelvin metre per watt',
      symbol: 'K·m/W',
      code: 'H35',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['thermalResistance']
    },
    kelvinPerBar: {
      name: 'kelvinPerBar',
      label: 'kelvin per bar',
      symbol: 'K/bar',
      code: 'F61',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    kelvinPerHour: {
      name: 'kelvinPerHour',
      label: 'kelvin per hour',
      symbol: 'K/h',
      code: 'F10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    kelvinPerKelvin: {
      name: 'kelvinPerKelvin',
      label: 'kelvin per kelvin',
      symbol: 'K/K',
      code: 'F02',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    kelvinPerMinute: {
      name: 'kelvinPerMinute',
      label: 'kelvin per minute',
      symbol: 'K/min',
      code: 'F11',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    kelvinPerPascal: {
      name: 'kelvinPerPascal',
      label: 'kelvin per pascal',
      symbol: 'K/Pa',
      code: 'N79',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    kelvinPerSecond: {
      name: 'kelvinPerSecond',
      label: 'kelvin per second',
      symbol: 'K/s',
      code: 'F12',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    kelvinPerWatt: {
      name: 'kelvinPerWatt',
      label: 'kelvin per watt',
      symbol: 'K/W',
      code: 'B21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['thermalResistance']
    },
    kibibit: {
      name: 'kibibit',
      label: 'kibibit',
      symbol: 'Kibit',
      code: 'C21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kibibitPerCubicMetre: {
      name: 'kibibitPerCubicMetre',
      label: 'kibibit per cubic metre',
      symbol: 'Kibit/m³',
      code: 'E74',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kibibitPerMetre: {
      name: 'kibibitPerMetre',
      label: 'kibibit per metre',
      symbol: 'Kibit/m',
      code: 'E72',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kibibitPerSquareMetre: {
      name: 'kibibitPerSquareMetre',
      label: 'kibibit per square metre',
      symbol: 'Kibit/m²',
      code: 'E73',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kibibyte: {
      name: 'kibibyte',
      label: 'kibibyte',
      symbol: 'Kibyte',
      code: 'E64',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '2¹⁰ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    kiloampere: {
      name: 'kiloampere',
      label: 'kiloampere',
      symbol: 'kA',
      code: 'B22',
      referenceUnit: function () {
        return sammUDefinition.units['ampere'];
      },
      conversionFactor: '10³ A',
      quantityKinds: [
        'magneticPotentialDifference',
        'electricCurrent',
        'magnetomotiveForce',
        'currentLinkage',
        'magneticPotentialDifference',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent'
      ]
    },
    kiloampereHourThousandAmpereHour: {
      name: 'kiloampereHourThousandAmpereHour',
      label: 'kiloampere hour (thousand ampere hour)',
      symbol: 'kA·h',
      code: 'TAH',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '3.6 × 10⁶ C',
      quantityKinds: [
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge'
      ]
    },
    kiloamperePerMetre: {
      name: 'kiloamperePerMetre',
      label: 'kiloampere per metre',
      symbol: 'kA/m',
      code: 'B24',
      referenceUnit: function () {
        return sammUDefinition.units['amperePerMetre'];
      },
      conversionFactor: '10³ A/m',
      quantityKinds: [
        'magneticFieldStrength',
        'magnetization',
        'linearElectricCurrentDensity',
        'lineicElectricCurrent',
        'linearElectricCurrentDensity',
        'magneticFieldStrength',
        'lineicElectricCurrent'
      ]
    },
    kiloamperePerSquareMetre: {
      name: 'kiloamperePerSquareMetre',
      label: 'kiloampere per square metre',
      symbol: 'kA/m²',
      code: 'B23',
      referenceUnit: function () {
        return sammUDefinition.units['amperePerSquareMetre'];
      },
      conversionFactor: '10³ A/m²',
      quantityKinds: ['currentDensity', 'currentDensity']
    },
    kilobar: {
      name: 'kilobar',
      label: 'kilobar',
      symbol: 'kbar',
      code: 'KBA',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁸ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'pressure',
        'modulusOfElasticity',
        'shearModulus',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'modulusOfRigidity',
        'modulusOfCompression'
      ]
    },
    kilobaud: {
      name: 'kilobaud',
      label: 'kilobaud',
      symbol: 'kBd',
      code: 'K50',
      referenceUnit: function () {
        return sammUDefinition.units['baud'];
      },
      conversionFactor: '10³ Bd',
      quantityKinds: null
    },
    kilobecquerel: {
      name: 'kilobecquerel',
      label: 'kilobecquerel',
      symbol: 'kBq',
      code: '2Q',
      referenceUnit: function () {
        return sammUDefinition.units['becquerel'];
      },
      conversionFactor: '10³ Bq',
      quantityKinds: ['activity', 'activity']
    },
    kilobecquerelPerKilogram: {
      name: 'kilobecquerelPerKilogram',
      label: 'kilobecquerel per kilogram',
      symbol: 'kBq/kg',
      code: 'B25',
      referenceUnit: function () {
        return sammUDefinition.units['becquerelPerKilogram'];
      },
      conversionFactor: '10³ Bq/kg',
      quantityKinds: ['specificActivityInASample', 'specificActivityInASample']
    },
    kilobit: {
      name: 'kilobit',
      label: 'kilobit',
      symbol: 'kbit',
      code: 'C37',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilobitPerSecond: {
      name: 'kilobitPerSecond',
      label: 'kilobit per second',
      symbol: 'kbit/s',
      code: 'C74',
      referenceUnit: function () {
        return sammUDefinition.units['bitPerSecond'];
      },
      conversionFactor: '10³ bit/s',
      quantityKinds: null
    },
    kilobyte: {
      name: 'kilobyte',
      label: 'Kilobyte',
      symbol: 'kbyte',
      code: '2P',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '10³ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    kilobytePerSecond: {
      name: 'kilobytePerSecond',
      label: 'kilobyte per second',
      symbol: 'kbyte/s',
      code: 'P94',
      referenceUnit: function () {
        return sammUDefinition.units['bytePerSecond'];
      },
      conversionFactor: '10³ byte/s',
      quantityKinds: null
    },
    kilocalorieInternationalTable: {
      name: 'kilocalorieInternationalTable',
      label: 'kilocalorie (international table)',
      symbol: 'kcalIT',
      code: 'E14',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '4.1868 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'energy',
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'enthalpy',
        'heat',
        'thermodynamicEnergy',
        'quantityOfHeat'
      ]
    },
    kilocalorieInternationalTablePerGramKelvin: {
      name: 'kilocalorieInternationalTablePerGramKelvin',
      label: 'kilocalorie (international table) per gram kelvin',
      symbol: '(kcalIT/K)/g',
      code: 'N65',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogramKelvin'];
      },
      conversionFactor: '4.1868 × 10⁶ J/(kg × K)',
      quantityKinds: [
        'entropy',
        'heatCapacity',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtConstantPressure'
      ]
    },
    kilocalorieInternationalTablePerHourMetreDegreeCelsius: {
      name: 'kilocalorieInternationalTablePerHourMetreDegreeCelsius',
      label: 'kilocalorie (international table) per hour metre degree Celsius',
      symbol: 'kcal/(m·h·°C)',
      code: 'K52',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['thermalConductivity']
    },
    kilocalorieMean: {
      name: 'kilocalorieMean',
      label: 'kilocalorie (mean)',
      symbol: 'kcal',
      code: 'K51',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '4.19002 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'thermodynamicEnergy',
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'quantityOfHeat',
        'enthalpy',
        'energy',
        'heat'
      ]
    },
    kilocalorieThermochemical: {
      name: 'kilocalorieThermochemical',
      label: 'kilocalorie (thermochemical)',
      symbol: 'kcalth',
      code: 'K53',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '4.184 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'quantityOfHeat',
        'helmholtzFreeEnergy',
        'enthalpy',
        'thermodynamicEnergy',
        'energy',
        'helmholtzFunction',
        'heat'
      ]
    },
    kilocalorieThermochemicalPerHour: {
      name: 'kilocalorieThermochemicalPerHour',
      label: 'kilocalorie (thermochemical) per hour',
      symbol: 'kcalth/h',
      code: 'E15',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '1.16222 W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    kilocalorieThermochemicalPerMinute: {
      name: 'kilocalorieThermochemicalPerMinute',
      label: 'kilocalorie (thermochemical) per minute',
      symbol: 'kcalth/min',
      code: 'K54',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '69.73333 W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    kilocalorieThermochemicalPerSecond: {
      name: 'kilocalorieThermochemicalPerSecond',
      label: 'kilocalorie (thermochemical) per second',
      symbol: 'kcalth/s',
      code: 'K55',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '4.184 × 10³ W',
      quantityKinds: [
        'heatFlowRate',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    kilocandela: {
      name: 'kilocandela',
      label: 'kilocandela',
      symbol: 'kcd',
      code: 'P33',
      referenceUnit: function () {
        return sammUDefinition.units['candela'];
      },
      conversionFactor: '10³ cd',
      quantityKinds: ['luminousIntensity', 'luminousIntensity']
    },
    kilocharacter: {
      name: 'kilocharacter',
      label: 'kilocharacter',
      symbol: null,
      code: 'KB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilocoulomb: {
      name: 'kilocoulomb',
      label: 'kilocoulomb',
      symbol: 'kC',
      code: 'B26',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '10³ C',
      quantityKinds: [
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'quantityOfElectricity'
      ]
    },
    kilocoulombPerCubicMetre: {
      name: 'kilocoulombPerCubicMetre',
      label: 'kilocoulomb per cubic metre',
      symbol: 'kC/m³',
      code: 'B27',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerCubicMetre'];
      },
      conversionFactor: '10³ C/m³',
      quantityKinds: ['volumicCharge', 'volumeDensityOfCharge', 'chargeDensity', 'volumicCharge', 'volumeDensityOfCharge', 'chargeDensity']
    },
    kilocoulombPerSquareMetre: {
      name: 'kilocoulombPerSquareMetre',
      label: 'kilocoulomb per square metre',
      symbol: 'kC/m²',
      code: 'B28',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerSquareMetre'];
      },
      conversionFactor: '10³ C/m²',
      quantityKinds: [
        'surfaceDensityOfCharge',
        'electricFluxDensity',
        'displacementElectricPolarization',
        'surfaceDensityOfCharge',
        'electricFluxDensity',
        'displacementElectricPolarization'
      ]
    },
    kilocurie: {
      name: 'kilocurie',
      label: 'kilocurie',
      symbol: 'kCi',
      code: '2R',
      referenceUnit: function () {
        return sammUDefinition.units['becquerel'];
      },
      conversionFactor: '3.7 × 10¹³ Bq',
      quantityKinds: ['activity', 'activity']
    },
    kiloelectronvolt: {
      name: 'kiloelectronvolt',
      label: 'kiloelectronvolt',
      symbol: 'keV',
      code: 'B29',
      referenceUnit: function () {
        return sammUDefinition.units['electronvolt'];
      },
      conversionFactor: '10³ eV',
      quantityKinds: [
        'potentialEnergy',
        'work',
        'energy',
        'kineticEnergy',
        'work',
        'kineticEnergy',
        'betaDisintegrationEnergy',
        'resonanceEnergy',
        'potentialEnergy',
        'energy',
        'fermiEnergy',
        'maximumBetaParticleEnergy'
      ]
    },
    kilofarad: {
      name: 'kilofarad',
      label: 'kilofarad',
      symbol: 'kF',
      code: 'N90',
      referenceUnit: function () {
        return sammUDefinition.units['farad'];
      },
      conversionFactor: '10³ F',
      quantityKinds: ['capacitance', 'capacitance']
    },
    kilogram: {
      name: 'kilogram',
      label: 'kilogram',
      symbol: 'kg',
      code: 'KGM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    kilogramCentimetrePerSecond: {
      name: 'kilogramCentimetrePerSecond',
      label: 'kilogram centimetre per second',
      symbol: 'kg·(cm/s)',
      code: 'M98',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetrePerSecond'];
      },
      conversionFactor: '10⁻² kg × m/s',
      quantityKinds: ['momentum', 'momentum']
    },
    kilogramDrainedNetWeight: {
      name: 'kilogramDrainedNetWeight',
      label: 'kilogram drained net weight',
      symbol: 'kg/net eda',
      code: 'KDW',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramDryWeight: {
      name: 'kilogramDryWeight',
      label: 'kilogram, dry weight',
      symbol: null,
      code: 'MND',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramForceMetrePerSquareCentimetre: {
      name: 'kilogramForceMetrePerSquareCentimetre',
      label: 'kilogram-force metre per square centimetre',
      symbol: 'kgf·m/cm²',
      code: 'E44',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramForcePerSquareCentimetre: {
      name: 'kilogramForcePerSquareCentimetre',
      label: 'kilogram-force per square centimetre',
      symbol: 'kgf/cm²',
      code: 'E42',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '9.80665 × 10⁴ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'shearModulus',
        'bulkModulus',
        'normalStress',
        'pressure',
        'shearStress',
        'modulusOfCompression',
        'modulusOfElasticity',
        'modulusOfRigidity'
      ]
    },
    kilogramForcePerSquareMillimetre: {
      name: 'kilogramForcePerSquareMillimetre',
      label: 'kilogram-force per square millimetre',
      symbol: 'kgf/mm²',
      code: 'E41',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '9.80665 × 10⁶ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'pressure',
        'bulkModulus',
        'shearModulus',
        'modulusOfCompression',
        'normalStress',
        'modulusOfRigidity',
        'modulusOfElasticity',
        'shearStress'
      ]
    },
    kilogramIncludingContainer: {
      name: 'kilogramIncludingContainer',
      label: 'kilogram, including container',
      symbol: null,
      code: 'KIC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramIncludingInnerPackaging: {
      name: 'kilogramIncludingInnerPackaging',
      label: 'kilogram, including inner packaging',
      symbol: null,
      code: 'KIP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramMetre: {
      name: 'kilogramMetre',
      label: 'kilogram metre',
      symbol: 'kg·m',
      code: 'M94',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    kilogramMetrePerSecond: {
      name: 'kilogramMetrePerSecond',
      label: 'kilogram metre per second',
      symbol: 'kg·m/s',
      code: 'B31',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['momentum']
    },
    kilogramMetrePerSecondSquared: {
      name: 'kilogramMetrePerSecondSquared',
      label: 'kilogram metre per second squared',
      symbol: 'kg·m/s²',
      code: 'M77',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['weight', 'force']
    },
    kilogramMetreSquared: {
      name: 'kilogramMetreSquared',
      label: 'kilogram metre squared',
      symbol: 'kg·m²',
      code: 'B32',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['momentOfInertiaDynamicMomentOfInertia']
    },
    kilogramMetreSquaredPerSecond: {
      name: 'kilogramMetreSquaredPerSecond',
      label: 'kilogram metre squared per second',
      symbol: 'kg·m²/s',
      code: 'B33',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['momentOfMomentum', 'angularMomentum']
    },
    kilogramNamedSubstance: {
      name: 'kilogramNamedSubstance',
      label: 'kilogram named substance',
      symbol: null,
      code: 'KNS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfCholineChloride: {
      name: 'kilogramOfCholineChloride',
      label: 'kilogram of choline chloride',
      symbol: 'kg C₅ H₁₄ClNO',
      code: 'KCC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfHydrogenPeroxide: {
      name: 'kilogramOfHydrogenPeroxide',
      label: 'kilogram of hydrogen peroxide',
      symbol: 'kg H₂O₂',
      code: 'KHY',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfImportedMeatLessOffal: {
      name: 'kilogramOfImportedMeatLessOffal',
      label: 'kilogram of imported meat, less offal',
      symbol: null,
      code: 'TMS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfMethylamine: {
      name: 'kilogramOfMethylamine',
      label: 'kilogram of methylamine',
      symbol: 'kg met.am.',
      code: 'KMA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfNitrogen: {
      name: 'kilogramOfNitrogen',
      label: 'kilogram of nitrogen',
      symbol: 'kg N',
      code: 'KNI',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfPhosphorusPentoxidePhosphoricAnhydride: {
      name: 'kilogramOfPhosphorusPentoxidePhosphoricAnhydride',
      label: 'kilogram of phosphorus pentoxide (phosphoric anhydride)',
      symbol: null,
      code: 'KPP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfPotassiumHydroxideCausticPotash: {
      name: 'kilogramOfPotassiumHydroxideCausticPotash',
      label: 'kilogram of potassium hydroxide (caustic potash)',
      symbol: 'kg KOH',
      code: 'KPH',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfPotassiumOxide: {
      name: 'kilogramOfPotassiumOxide',
      label: 'kilogram of potassium oxide',
      symbol: 'kg K₂O',
      code: 'KPO',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfSodiumHydroxideCausticSoda: {
      name: 'kilogramOfSodiumHydroxideCausticSoda',
      label: 'kilogram of sodium hydroxide (caustic soda)',
      symbol: 'kg NaOH',
      code: 'KSH',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfSubstance90PercentDry: {
      name: 'kilogramOfSubstance90PercentDry',
      label: 'kilogram of substance 90 % dry',
      symbol: 'kg 90 % sdt',
      code: 'KSD',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfTungstenTrioxide: {
      name: 'kilogramOfTungstenTrioxide',
      label: 'kilogram of tungsten trioxide',
      symbol: 'kg WO₃',
      code: 'KWO',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramOfUranium: {
      name: 'kilogramOfUranium',
      label: 'kilogram of uranium',
      symbol: 'kg U',
      code: 'KUR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramPerBar: {
      name: 'kilogramPerBar',
      label: 'kilogram per bar',
      symbol: 'kg/bar',
      code: 'H53',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerCubicCentimetre: {
      name: 'kilogramPerCubicCentimetre',
      label: 'kilogram per cubic centimetre',
      symbol: 'kg/cm³',
      code: 'G31',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerCubicCentimetreBar: {
      name: 'kilogramPerCubicCentimetreBar',
      label: 'kilogram per cubic centimetre bar',
      symbol: 'kg/(cm³·bar)',
      code: 'G16',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerCubicCentimetreKelvin: {
      name: 'kilogramPerCubicCentimetreKelvin',
      label: 'kilogram per cubic centimetre kelvin',
      symbol: 'kg/(cm³·K)',
      code: 'G38',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerCubicDecimetre: {
      name: 'kilogramPerCubicDecimetre',
      label: 'kilogram per cubic decimetre',
      symbol: 'kg/dm³',
      code: 'B34',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10³ kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'density',
        'volumicMass',
        'massDensity'
      ]
    },
    kilogramPerCubicDecimetreBar: {
      name: 'kilogramPerCubicDecimetreBar',
      label: 'kilogram per cubic decimetre bar',
      symbol: '(kg/dm³)/bar',
      code: 'H55',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerCubicDecimetreKelvin: {
      name: 'kilogramPerCubicDecimetreKelvin',
      label: 'kilogram per cubic decimetre kelvin',
      symbol: '(kg/dm³)/K',
      code: 'H54',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerCubicMetre: {
      name: 'kilogramPerCubicMetre',
      label: 'kilogram per cubic metre',
      symbol: 'kg/m³',
      code: 'KMQ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'concentrationOfB', 'amountOfSubstance', 'density', 'massDensity', 'massConcentrationOfB']
    },
    kilogramPerCubicMetreBar: {
      name: 'kilogramPerCubicMetreBar',
      label: 'kilogram per cubic metre bar',
      symbol: 'kg/(m³·bar)',
      code: 'G18',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerCubicMetreKelvin: {
      name: 'kilogramPerCubicMetreKelvin',
      label: 'kilogram per cubic metre kelvin',
      symbol: 'kg/(m³·K)',
      code: 'G40',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerCubicMetrePascal: {
      name: 'kilogramPerCubicMetrePascal',
      label: 'kilogram per cubic metre pascal',
      symbol: '(kg/m³)/Pa',
      code: 'M73',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerDay: {
      name: 'kilogramPerDay',
      label: 'kilogram per day',
      symbol: 'kg/d',
      code: 'F30',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerDayBar: {
      name: 'kilogramPerDayBar',
      label: 'kilogram per day bar',
      symbol: 'kg/(d·bar)',
      code: 'F66',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerDayKelvin: {
      name: 'kilogramPerDayKelvin',
      label: 'kilogram per day kelvin',
      symbol: 'kg/(d·K)',
      code: 'F39',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerHour: {
      name: 'kilogramPerHour',
      label: 'kilogram per hour',
      symbol: 'kg/h',
      code: 'E93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerHourBar: {
      name: 'kilogramPerHourBar',
      label: 'kilogram per hour bar',
      symbol: 'kg/(h·bar)',
      code: 'F67',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerHourKelvin: {
      name: 'kilogramPerHourKelvin',
      label: 'kilogram per hour kelvin',
      symbol: 'kg/(h·K)',
      code: 'F40',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerKelvin: {
      name: 'kilogramPerKelvin',
      label: 'kilogram per kelvin',
      symbol: 'kg/K',
      code: 'F15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerKilogram: {
      name: 'kilogramPerKilogram',
      label: 'kilogram per kilogram',
      symbol: 'kg/kg',
      code: 'M29',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massRatio']
    },
    kilogramPerKilometre: {
      name: 'kilogramPerKilometre',
      label: 'kilogram per kilometre',
      symbol: 'kg/km',
      code: 'M31',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '10⁻³ kg/m',
      quantityKinds: ['linearMass', 'linearDensity', 'linearMass', 'linearDensity']
    },
    kilogramPerKilomol: {
      name: 'kilogramPerKilomol',
      label: 'kilogram per kilomol',
      symbol: 'kg/kmol',
      code: 'F24',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerLitre: {
      name: 'kilogramPerLitre',
      label: 'kilogram per litre',
      symbol: 'kg/l or kg/L',
      code: 'B35',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10³ kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'concentrationOfB',
        'density',
        'amountOfSubstance',
        'volumicMass',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    kilogramPerLitreBar: {
      name: 'kilogramPerLitreBar',
      label: 'kilogram per litre bar',
      symbol: 'kg/(l·bar)',
      code: 'G17',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerLitreKelvin: {
      name: 'kilogramPerLitreKelvin',
      label: 'kilogram per litre kelvin',
      symbol: 'kg/(l·K)',
      code: 'G39',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerMetre: {
      name: 'kilogramPerMetre',
      label: 'kilogram per metre',
      symbol: 'kg/m',
      code: 'KL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['linearMass', 'linearDensity']
    },
    kilogramPerMetreDay: {
      name: 'kilogramPerMetreDay',
      label: 'kilogram per metre day',
      symbol: 'kg/(m·d)',
      code: 'N39',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '1.15741 × 10⁻⁵ Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    kilogramPerMetreHour: {
      name: 'kilogramPerMetreHour',
      label: 'kilogram per metre hour',
      symbol: 'kg/(m·h)',
      code: 'N40',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    kilogramPerMetreMinute: {
      name: 'kilogramPerMetreMinute',
      label: 'kilogram per metre minute',
      symbol: 'kg/(m·min)',
      code: 'N38',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '1.66667 × 10⁻² Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    kilogramPerMetreSecond: {
      name: 'kilogramPerMetreSecond',
      label: 'kilogram per metre second',
      symbol: 'kg/(m·s)',
      code: 'N37',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: 'Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    kilogramPerMillimetre: {
      name: 'kilogramPerMillimetre',
      label: 'kilogram per millimetre',
      symbol: 'kg/mm',
      code: 'KW',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '10³ kg/m',
      quantityKinds: ['linearMass', 'linearDensity', 'linearMass', 'linearDensity']
    },
    kilogramPerMillimetreWidth: {
      name: 'kilogramPerMillimetreWidth',
      label: 'kilogram per millimetre width',
      symbol: null,
      code: 'KI',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '10³ kg/m',
      quantityKinds: ['linearMass', 'linearDensity']
    },
    kilogramPerMinute: {
      name: 'kilogramPerMinute',
      label: 'kilogram per minute',
      symbol: 'kg/min',
      code: 'F31',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerMinuteBar: {
      name: 'kilogramPerMinuteBar',
      label: 'kilogram per minute bar',
      symbol: 'kg/(min·bar)',
      code: 'F68',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerMinuteKelvin: {
      name: 'kilogramPerMinuteKelvin',
      label: 'kilogram per minute kelvin',
      symbol: 'kg/(min·K)',
      code: 'F41',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerMole: {
      name: 'kilogramPerMole',
      label: 'kilogram per mole',
      symbol: 'kg/mol',
      code: 'D74',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['molarMass']
    },
    kilogramPerPascal: {
      name: 'kilogramPerPascal',
      label: 'kilogram per pascal',
      symbol: 'kg/Pa',
      code: 'M74',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramPerSecond: {
      name: 'kilogramPerSecond',
      label: 'kilogram per second',
      symbol: 'kg/s',
      code: 'KGS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerSecondBar: {
      name: 'kilogramPerSecondBar',
      label: 'kilogram per second bar',
      symbol: 'kg/(s·bar)',
      code: 'F69',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerSecondKelvin: {
      name: 'kilogramPerSecondKelvin',
      label: 'kilogram per second kelvin',
      symbol: 'kg/(s·K)',
      code: 'F42',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerSecondPascal: {
      name: 'kilogramPerSecondPascal',
      label: 'kilogram per second pascal',
      symbol: '(kg/s)/Pa',
      code: 'M87',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramPerSquareCentimetre: {
      name: 'kilogramPerSquareCentimetre',
      label: 'kilogram per square centimetre',
      symbol: 'kg/cm²',
      code: 'D5',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '10⁴ kg/m²',
      quantityKinds: ['surfaceDensity', 'areicMass', 'surfaceDensity', 'meanMassRange', 'areicMass']
    },
    kilogramPerSquareMetre: {
      name: 'kilogramPerSquareMetre',
      label: 'kilogram per square metre',
      symbol: 'kg/m²',
      code: '28',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['surfaceDensity', 'meanMassRange', 'areicMass']
    },
    kilogramPerSquareMetrePascalSecond: {
      name: 'kilogramPerSquareMetrePascalSecond',
      label: 'kilogram per square metre pascal second',
      symbol: 'kg/(m²·Pa·s)',
      code: 'Q28',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilogramPerSquareMetreSecond: {
      name: 'kilogramPerSquareMetreSecond',
      label: 'kilogram per square metre second',
      symbol: 'kg/(m²·s)',
      code: 'H56',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    kilogramSquareCentimetre: {
      name: 'kilogramSquareCentimetre',
      label: 'kilogram square centimetre',
      symbol: 'kg·cm²',
      code: 'F18',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilogramSquareMillimetre: {
      name: 'kilogramSquareMillimetre',
      label: 'kilogram square millimetre',
      symbol: 'kg·mm²',
      code: 'F19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    kilohenry: {
      name: 'kilohenry',
      label: 'kilohenry',
      symbol: 'kH',
      code: 'P24',
      referenceUnit: function () {
        return sammUDefinition.units['henry'];
      },
      conversionFactor: '10³ H',
      quantityKinds: ['permeance', 'mutualInductance', 'selfInductance', 'selfInductance', 'permeance', 'mutualInductance']
    },
    kilohertz: {
      name: 'kilohertz',
      label: 'kilohertz',
      symbol: 'kHz',
      code: 'KHZ',
      referenceUnit: function () {
        return sammUDefinition.units['hertz'];
      },
      conversionFactor: '10³ Hz',
      quantityKinds: ['frequency', 'frequency']
    },
    kilohertzMetre: {
      name: 'kilohertzMetre',
      label: 'kilohertz metre',
      symbol: 'kHz·m',
      code: 'M17',
      referenceUnit: function () {
        return sammUDefinition.units['hertzMetre'];
      },
      conversionFactor: '10³ Hz × m',
      quantityKinds: ['performanceCharacteristic', 'coefficient', 'performanceCharacteristic', 'coefficient']
    },
    kilojoule: {
      name: 'kilojoule',
      label: 'kilojoule',
      symbol: 'kJ',
      code: 'KJO',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'kineticEnergy',
        'energy',
        'potentialEnergy',
        'work'
      ]
    },
    kilojoulePerDay: {
      name: 'kilojoulePerDay',
      label: 'kilojoule per day',
      symbol: 'kJ/d',
      code: 'P21',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '1.15741 × 10⁻² W',
      quantityKinds: [
        'powerForDirectCurrent',
        'activePower',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    kilojoulePerHour: {
      name: 'kilojoulePerHour',
      label: 'kilojoule per hour',
      symbol: 'kJ/h',
      code: 'P20',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '2.77778 × 10⁻¹ W',
      quantityKinds: [
        'powerForDirectCurrent',
        'activePower',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    kilojoulePerKelvin: {
      name: 'kilojoulePerKelvin',
      label: 'kilojoule per kelvin',
      symbol: 'kJ/K',
      code: 'B41',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKelvin'];
      },
      conversionFactor: '10³ J/K',
      quantityKinds: ['heatCapacity', 'entropy', 'boltzmannConstant', 'entropy', 'massieuFunction', 'heatCapacity', 'planckFunction']
    },
    kilojoulePerKilogram: {
      name: 'kilojoulePerKilogram',
      label: 'kilojoule per kilogram',
      symbol: 'kJ/kg',
      code: 'B42',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogram'];
      },
      conversionFactor: '10³ J/kg',
      quantityKinds: ['specificEnergy', 'massicEnergy', 'specificEnthalpy', 'massicEnthalpy']
    },
    kilojoulePerKilogramKelvin: {
      name: 'kilojoulePerKilogramKelvin',
      label: 'kilojoule per kilogram kelvin',
      symbol: 'kJ/(kg·K)',
      code: 'B43',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogramKelvin'];
      },
      conversionFactor: '10³ J/(kg × K)',
      quantityKinds: [
        'specificHeatCapacityAtConstantPressure',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtSaturation',
        'specificHeatCapacityAtConstantVolume',
        'specificHeatCapacityAtConstantPressure'
      ]
    },
    kilojoulePerMinute: {
      name: 'kilojoulePerMinute',
      label: 'kilojoule per minute',
      symbol: 'kJ/min',
      code: 'P19',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '1.66667 × 10 W',
      quantityKinds: [
        'activePower',
        'powerForDirectCurrent',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    kilojoulePerMole: {
      name: 'kilojoulePerMole',
      label: 'kilojoule per mole',
      symbol: 'kJ/mol',
      code: 'B44',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerMole'];
      },
      conversionFactor: '10³ J/mol',
      quantityKinds: ['molarThermodynamicEnergy', 'chemicalPotential', 'affinityOfAChemicalReaction', 'molarThermodynamicEnergy']
    },
    kilojoulePerSecond: {
      name: 'kilojoulePerSecond',
      label: 'kilojoule per second',
      symbol: 'kJ/s',
      code: 'P18',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10³ W',
      quantityKinds: [
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower',
        'powerForDirectCurrent',
        'activePower'
      ]
    },
    kilolitre: {
      name: 'kilolitre',
      label: 'kilolitre',
      symbol: 'kl',
      code: 'K6',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: 'm³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    kilolitrePerHour: {
      name: 'kilolitrePerHour',
      label: 'kilolitre per hour',
      symbol: 'kl/h',
      code: '4X',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    kilolux: {
      name: 'kilolux',
      label: 'kilolux',
      symbol: 'klx',
      code: 'KLX',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['illuminance']
    },
    kilometre: {
      name: 'kilometre',
      label: 'kilometre',
      symbol: 'km',
      code: 'KMT',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10³ m',
      quantityKinds: [
        'cartesianCoordinates',
        'thickness',
        'breadth',
        'distance',
        'diameter',
        'length',
        'lengthOfPath',
        'radiusOfCurvature',
        'height',
        'radius',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    kilometrePerHour: {
      name: 'kilometrePerHour',
      label: 'kilometre per hour',
      symbol: 'km/h',
      code: 'KMH',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '0.277778 m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'groupVelocity',
        'phaseVelocity',
        'velocity'
      ]
    },
    kilometrePerSecond: {
      name: 'kilometrePerSecond',
      label: 'kilometre per second',
      symbol: 'km/s',
      code: 'M62',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '10³ m/s',
      quantityKinds: [
        'groupVelocity',
        'velocity',
        'phaseVelocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    kilometrePerSecondSquared: {
      name: 'kilometrePerSecondSquared',
      label: 'kilometre per second squared',
      symbol: 'km/s²',
      code: 'M38',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '10³ m/s²',
      quantityKinds: [
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'acceleration',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    kilomole: {
      name: 'kilomole',
      label: 'kilomole',
      symbol: 'kmol',
      code: 'B45',
      referenceUnit: function () {
        return sammUDefinition.units['mole'];
      },
      conversionFactor: '10³ mol',
      quantityKinds: ['amountOfSubstance', 'amountOfSubstance']
    },
    kilomolePerCubicMetre: {
      name: 'kilomolePerCubicMetre',
      label: 'kilomole per cubic metre',
      symbol: 'kmol/m³',
      code: 'B46',
      referenceUnit: function () {
        return sammUDefinition.units['molePerCubicMetre'];
      },
      conversionFactor: '10³ mol/m³',
      quantityKinds: [
        'concentrationOfB',
        'massConcentrationOfB',
        'density',
        'massDensity',
        'volumicMass',
        'amountOfSubstance',
        'amountOfSubstance',
        'concentrationOfB',
        'massDensity',
        'density',
        'volumicMass',
        'massConcentrationOfB'
      ]
    },
    kilomolePerCubicMetreBar: {
      name: 'kilomolePerCubicMetreBar',
      label: 'kilomole per cubic metre bar',
      symbol: '(kmol/m³)/bar',
      code: 'K60',
      referenceUnit: function () {
        return sammUDefinition.units['molPerCubicMetrePascal'];
      },
      conversionFactor: '10⁻² (mol/m³)/Pa',
      quantityKinds: [
        'density',
        'massDensity',
        'massConcentrationOfB',
        'concentrationOfB',
        'volumicMass',
        'amountOfSubstance',
        'amountOfSubstance',
        'massDensity',
        'density',
        'massConcentrationOfB',
        'concentrationOfB',
        'volumicMass'
      ]
    },
    kilomolePerCubicMetreKelvin: {
      name: 'kilomolePerCubicMetreKelvin',
      label: 'kilomole per cubic metre kelvin',
      symbol: '(kmol/m³)/K',
      code: 'K59',
      referenceUnit: function () {
        return sammUDefinition.units['molePerCubicMetreKelvin'];
      },
      conversionFactor: '10³ (mol/m³)/K',
      quantityKinds: [
        'concentrationOfB',
        'density',
        'massConcentrationOfB',
        'massDensity',
        'volumicMass',
        'amountOfSubstance',
        'massConcentrationOfB',
        'amountOfSubstance',
        'density',
        'volumicMass',
        'massDensity',
        'concentrationOfB'
      ]
    },
    kilomolePerHour: {
      name: 'kilomolePerHour',
      label: 'kilomole per hour',
      symbol: 'kmol/h',
      code: 'K58',
      referenceUnit: function () {
        return sammUDefinition.units['molePerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻¹ mol/s',
      quantityKinds: ['volumicMass', 'amountOfSubstance', 'massConcentrationOfB', 'density', 'concentrationOfB', 'massDensity', 'molarFlux']
    },
    kilomolePerKilogram: {
      name: 'kilomolePerKilogram',
      label: 'kilomole per kilogram',
      symbol: 'kmol/kg',
      code: 'P47',
      referenceUnit: function () {
        return sammUDefinition.units['molePerKilogram'];
      },
      conversionFactor: '10³ mol/kg',
      quantityKinds: ['molalityOfSoluteB', 'ionicStrength']
    },
    kilomolePerMinute: {
      name: 'kilomolePerMinute',
      label: 'kilomole per minute',
      symbol: 'kmol/min',
      code: 'K61',
      referenceUnit: function () {
        return sammUDefinition.units['molePerSecond'];
      },
      conversionFactor: '16.6667 mol/s',
      quantityKinds: ['molarFlux', 'volumicMass', 'amountOfSubstance', 'massConcentrationOfB', 'density', 'concentrationOfB', 'massDensity']
    },
    kilomolePerSecond: {
      name: 'kilomolePerSecond',
      label: 'kilomole per second',
      symbol: 'kmol/s',
      code: 'E94',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['catalyticActivity']
    },
    kilonewton: {
      name: 'kilonewton',
      label: 'kilonewton',
      symbol: 'kN',
      code: 'B47',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '10³ N',
      quantityKinds: ['weight', 'force', 'weight', 'force']
    },
    kilonewtonMetre: {
      name: 'kilonewtonMetre',
      label: 'kilonewton metre',
      symbol: 'kN·m',
      code: 'B48',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '10³ N × m',
      quantityKinds: ['momentOfForce', 'momentOfACouple', 'torque', 'torque', 'momentOfForce', 'momentOfACouple']
    },
    kilonewtonPerMetre: {
      name: 'kilonewtonPerMetre',
      label: 'kilonewton per metre',
      symbol: 'kN/m',
      code: 'N31',
      referenceUnit: function () {
        return sammUDefinition.units['newtonPerMetre'];
      },
      conversionFactor: '10³ N/m',
      quantityKinds: ['surfaceTension', 'surfaceTension']
    },
    kiloohm: {
      name: 'kiloohm',
      label: 'kiloohm',
      symbol: 'kΩ',
      code: 'B49',
      referenceUnit: function () {
        return sammUDefinition.units['ohm'];
      },
      conversionFactor: '10³ Ω',
      quantityKinds: [
        'modulusOfImpedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'impedance',
        'resistanceToDirectCurrent',
        'modulusOfImpedance',
        'impedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'resistanceToDirectCurrent',
        'complexImpedances'
      ]
    },
    kiloohmMetre: {
      name: 'kiloohmMetre',
      label: 'kiloohm metre',
      symbol: 'kΩ·m',
      code: 'B50',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '10³ Ω × m',
      quantityKinds: ['resistivity', 'residualResistivity', 'resistivity']
    },
    kilopascal: {
      name: 'kilopascal',
      label: 'kilopascal',
      symbol: 'kPa',
      code: 'KPA',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10³ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'normalStress',
        'modulusOfCompression',
        'modulusOfRigidity',
        'shearStress',
        'bulkModulus',
        'shearModulus',
        'pressure',
        'modulusOfElasticity'
      ]
    },
    kilopascalPerBar: {
      name: 'kilopascalPerBar',
      label: 'kilopascal per bar',
      symbol: 'kPa/bar',
      code: 'F03',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureRatio']
    },
    kilopascalPerKelvin: {
      name: 'kilopascalPerKelvin',
      label: 'kilopascal per kelvin',
      symbol: 'kPa/K',
      code: 'F83',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'bulkModulus',
        'pressure',
        'shearStress',
        'shearModulus',
        'normalStress',
        'modulusOfRigidity',
        'modulusOfCompression',
        'modulusOfElasticity'
      ]
    },
    kilopascalPerMetre: {
      name: 'kilopascalPerMetre',
      label: 'kilopascal per metre',
      symbol: 'kPa/m',
      code: 'P81',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    kilopascalPerMillimetre: {
      name: 'kilopascalPerMillimetre',
      label: 'kilopascal per millimetre',
      symbol: 'kPa/mm',
      code: '34',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    kilopascalSquareMetrePerGram: {
      name: 'kilopascalSquareMetrePerGram',
      label: 'kilopascal square metre per gram',
      symbol: 'kPa·m²/g',
      code: '33',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '10⁶ m/s²',
      quantityKinds: [
        'burstIndex',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    kilopoundForce: {
      name: 'kilopoundForce',
      label: 'kilopound-force',
      symbol: 'kip',
      code: 'M75',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '4.448222 × 10³ N',
      quantityKinds: ['weight', 'force', 'weight', 'force']
    },
    kilopoundPerHour: {
      name: 'kilopoundPerHour',
      label: 'kilopound per hour',
      symbol: 'klb/h',
      code: 'M90',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '0.125997889 kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    kiloroentgen: {
      name: 'kiloroentgen',
      label: 'kiloroentgen',
      symbol: 'kR',
      code: 'KR',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerKilogram'];
      },
      conversionFactor: '2.58 × 10⁻¹ C/kg',
      quantityKinds: ['exposure', 'exposure']
    },
    kilosecond: {
      name: 'kilosecond',
      label: 'kilosecond',
      symbol: 'ks',
      code: 'B52',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10³ s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    kilosegment: {
      name: 'kilosegment',
      label: 'kilosegment',
      symbol: null,
      code: 'KJ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilosiemens: {
      name: 'kilosiemens',
      label: 'kilosiemens',
      symbol: 'kS',
      code: 'B53',
      referenceUnit: function () {
        return sammUDefinition.units['siemens'];
      },
      conversionFactor: '10³ S',
      quantityKinds: [
        'admittance',
        'modulusOfAdmittance',
        'conductanceForAlternatingCurrent',
        'conductanceForDirectCurrent',
        'complexAdmittance',
        'modulusOfAdmittance',
        'complexAdmittance',
        'admittance',
        'conductanceForDirectCurrent',
        'conductanceForAlternatingCurrent'
      ]
    },
    kilosiemensPerMetre: {
      name: 'kilosiemensPerMetre',
      label: 'kilosiemens per metre',
      symbol: 'kS/m',
      code: 'B54',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10³ S/m',
      quantityKinds: ['electrolyticConductivity', 'conductivity', 'conductivity']
    },
    kilotesla: {
      name: 'kilotesla',
      label: 'kilotesla',
      symbol: 'kT',
      code: 'P13',
      referenceUnit: function () {
        return sammUDefinition.units['tesla'];
      },
      conversionFactor: '10³ T',
      quantityKinds: [
        'magneticPolarization',
        'lowerCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticInduction',
        'thermodynamicCriticalMagneticFluxDensity',
        'upperCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticPolarization',
        'magneticInduction'
      ]
    },
    kilotonne: {
      name: 'kilotonne',
      label: 'kilotonne',
      symbol: 'kt',
      code: 'KTN',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10⁶ kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass', 'mass']
    },
    kilovar: {
      name: 'kilovar',
      label: 'kilovar',
      symbol: 'kvar',
      code: 'KVR',
      referenceUnit: function () {
        return sammUDefinition.units['voltAmpere'];
      },
      conversionFactor: '10³ V × A',
      quantityKinds: ['apparentPower', 'reactivePower']
    },
    kilovolt: {
      name: 'kilovolt',
      label: 'kilovolt',
      symbol: 'kV',
      code: 'KVT',
      referenceUnit: function () {
        return sammUDefinition.units['volt'];
      },
      conversionFactor: '10³ V',
      quantityKinds: [
        'electricPotential',
        'potentialDifference',
        'voltage',
        'electromotiveForce',
        'tension',
        'thermoelectromotiveForceBetweenSubstancesAAndB',
        'electricPotential',
        'peltierCoefficientForSubstancesAAndB',
        'electromotiveForce',
        'potentialDifference',
        'tension',
        'voltage'
      ]
    },
    kilovoltAmpere: {
      name: 'kilovoltAmpere',
      label: 'kilovolt - ampere',
      symbol: 'kV·A',
      code: 'KVA',
      referenceUnit: function () {
        return sammUDefinition.units['voltAmpere'];
      },
      conversionFactor: '10³ V × A',
      quantityKinds: ['apparentPower', 'apparentPower']
    },
    kilovoltAmpereHour: {
      name: 'kilovoltAmpereHour',
      label: 'kilovolt ampere hour',
      symbol: 'kVAh',
      code: 'C79',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilovoltAmpereReactiveDemand: {
      name: 'kilovoltAmpereReactiveDemand',
      label: 'kilovolt ampere reactive demand',
      symbol: null,
      code: 'K2',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilovoltAmpereReactiveHour: {
      name: 'kilovoltAmpereReactiveHour',
      label: 'kilovolt ampere reactive hour',
      symbol: 'kvar·h',
      code: 'K3',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilovoltPerMetre: {
      name: 'kilovoltPerMetre',
      label: 'kilovolt per metre',
      symbol: 'kV/m',
      code: 'B55',
      referenceUnit: function () {
        return sammUDefinition.units['voltPerMetre'];
      },
      conversionFactor: '10³ V/m',
      quantityKinds: ['electricFieldStrength', 'electricFieldStrength']
    },
    kilowatt: {
      name: 'kilowatt',
      label: 'kilowatt',
      symbol: 'kW',
      code: 'KWT',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10³ W',
      quantityKinds: [
        'heatFlowRate',
        'powerForDirectCurrent',
        'power',
        'activePower',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    kilowattDemand: {
      name: 'kilowattDemand',
      label: 'kilowatt demand',
      symbol: null,
      code: 'K1',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilowattHour: {
      name: 'kilowattHour',
      label: 'kilowatt hour',
      symbol: 'kW·h',
      code: 'KWH',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '3.6 × 10⁶ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'potentialEnergy',
        'energy',
        'kineticEnergy'
      ]
    },
    kilowattHourPerCubicMetre: {
      name: 'kilowattHourPerCubicMetre',
      label: 'kilowatt hour per cubic metre',
      symbol: 'kW·h/m³',
      code: 'E46',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerCubicMetre'];
      },
      conversionFactor: '3.6 × 10⁶ J/m³',
      quantityKinds: [
        'electromagneticEnergyDensity',
        'volumicElectromagneticEnergy',
        'soundEnergy',
        'soundEnergyDensity',
        'volumic',
        'radiantEnergyDensity'
      ]
    },
    kilowattHourPerHour: {
      name: 'kilowattHourPerHour',
      label: 'kilowatt hour per hour',
      symbol: 'kW·h/h',
      code: 'D03',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    kilowattHourPerKelvin: {
      name: 'kilowattHourPerKelvin',
      label: 'kilowatt hour per kelvin',
      symbol: 'kW·h/K',
      code: 'E47',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKelvin'];
      },
      conversionFactor: '3.6 × 10⁶ J/K',
      quantityKinds: ['boltzmannConstant', 'entropy', 'massieuFunction', 'heatCapacity', 'planckFunction']
    },
    kilowattPerMetreDegreeCelsius: {
      name: 'kilowattPerMetreDegreeCelsius',
      label: 'kilowatt per metre degree Celsius',
      symbol: 'kW/(m·°C)',
      code: 'N82',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '10³ W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    kilowattPerMetreKelvin: {
      name: 'kilowattPerMetreKelvin',
      label: 'kilowatt per metre kelvin',
      symbol: 'kW/(m·K)',
      code: 'N81',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: '10³ W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    kilowattPerSquareMetreKelvin: {
      name: 'kilowattPerSquareMetreKelvin',
      label: 'kilowatt per square metre kelvin',
      symbol: 'kW/(m²·K)',
      code: 'N78',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetreKelvin'];
      },
      conversionFactor: '10³ W/(m² × K)',
      quantityKinds: ['surfaceCoefficientOfHeatTransfer', 'coefficientOfHeatTransfer']
    },
    kiloweber: {
      name: 'kiloweber',
      label: 'kiloweber',
      symbol: 'kWb',
      code: 'P11',
      referenceUnit: function () {
        return sammUDefinition.units['weber'];
      },
      conversionFactor: '10³ Wb',
      quantityKinds: ['magneticFluxQuantum', 'magneticFlux', 'magneticFlux']
    },
    kiloweberPerMetre: {
      name: 'kiloweberPerMetre',
      label: 'kiloweber per metre',
      symbol: 'kWb/m',
      code: 'B56',
      referenceUnit: function () {
        return sammUDefinition.units['weberPerMetre'];
      },
      conversionFactor: '10³ Wb/m',
      quantityKinds: ['magneticVectorPotential', 'magneticVectorPotential']
    },
    kipPerSquareInch: {
      name: 'kipPerSquareInch',
      label: 'kip per square inch',
      symbol: 'ksi',
      code: 'N20',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '6.894757 × 10⁶ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'bulkModulus',
        'modulusOfRigidity',
        'normalStress',
        'pressure',
        'modulusOfCompression',
        'modulusOfElasticity',
        'shearModulus',
        'shearStress'
      ]
    },
    kit: {
      name: 'kit',
      label: 'kit',
      symbol: null,
      code: 'KT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    knot: {
      name: 'knot',
      label: 'knot',
      symbol: 'kn',
      code: 'KNT',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '0.514444 m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'groupVelocity',
        'phaseVelocity',
        'velocity'
      ]
    },
    labourHour: {
      name: 'labourHour',
      label: 'labour hour',
      symbol: null,
      code: 'LH',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lacticDryMaterialPercentage: {
      name: 'lacticDryMaterialPercentage',
      label: 'lactic dry material percentage',
      symbol: null,
      code: 'KLK',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lactoseExcessPercentage: {
      name: 'lactoseExcessPercentage',
      label: 'lactose excess percentage',
      symbol: null,
      code: 'LAC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lambert: {
      name: 'lambert',
      label: 'lambert',
      symbol: 'Lb',
      code: 'P30',
      referenceUnit: function () {
        return sammUDefinition.units['candelaPerSquareMetre'];
      },
      conversionFactor: '3.183099 × 10³ cd/m²',
      quantityKinds: ['luminance', 'luminance']
    },
    langley: {
      name: 'langley',
      label: 'langley',
      symbol: 'Ly',
      code: 'P40',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerSquareMetre'];
      },
      conversionFactor: '4.184 × 10⁴ J/m²',
      quantityKinds: ['radiantEnergyFluence', 'radianceExposure', 'radiantEnergyFluence', 'radianceExposure', 'energyFluence']
    },
    layer: {
      name: 'layer',
      label: 'layer',
      symbol: null,
      code: 'LR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    leaf: {
      name: 'leaf',
      label: 'leaf',
      symbol: null,
      code: 'LEF',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lengthUnit: {
      name: 'lengthUnit',
      label: 'length',
      symbol: null,
      code: 'LN',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lightYear: {
      name: 'lightYear',
      label: 'light year',
      symbol: 'ly',
      code: 'B57',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '9.46073 × 10¹⁵ m',
      quantityKinds: [
        'cartesianCoordinates',
        'radius',
        'distance',
        'radiusOfCurvature',
        'diameter',
        'lengthOfPath',
        'length',
        'breadth',
        'thickness',
        'height',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    linearFoot: {
      name: 'linearFoot',
      label: 'linear foot',
      symbol: null,
      code: 'LF',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    linearMetre: {
      name: 'linearMetre',
      label: 'linear metre',
      symbol: null,
      code: 'LM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    linearYard: {
      name: 'linearYard',
      label: 'linear yard',
      symbol: null,
      code: 'LY',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    link: {
      name: 'link',
      label: 'link',
      symbol: null,
      code: 'LK',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    liquidPintUs: {
      name: 'liquidPintUs',
      label: 'liquid pint (US)',
      symbol: 'liq pt (US)',
      code: 'PTL',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '4. 731765 × 10⁻⁴ m³',
      quantityKinds: ['volume', 'sectionModulus', 'volume']
    },
    liquidPound: {
      name: 'liquidPound',
      label: 'liquid pound',
      symbol: null,
      code: 'LP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    liquidQuartUs: {
      name: 'liquidQuartUs',
      label: 'liquid quart (US)',
      symbol: 'liq qt (US)',
      code: 'QTL',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '9.463529 × 10⁻⁴ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    litre: {
      name: 'litre',
      label: 'litre',
      symbol: 'l',
      code: 'LTR',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    litreOfPureAlcohol: {
      name: 'litreOfPureAlcohol',
      label: 'litre of pure alcohol',
      symbol: null,
      code: 'LPA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    litrePerBar: {
      name: 'litrePerBar',
      label: 'litre per bar',
      symbol: 'l/bar',
      code: 'G95',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volume']
    },
    litrePerDay: {
      name: 'litrePerDay',
      label: 'litre per day',
      symbol: 'l/d',
      code: 'LD',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.15741 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    litrePerDayBar: {
      name: 'litrePerDayBar',
      label: 'litre per day bar',
      symbol: 'l/(d·bar)',
      code: 'G82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    litrePerDayKelvin: {
      name: 'litrePerDayKelvin',
      label: 'litre per day kelvin',
      symbol: 'l/(d·K)',
      code: 'G65',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    litrePerHour: {
      name: 'litrePerHour',
      label: 'litre per hour',
      symbol: 'l/h',
      code: 'E32',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    litrePerHourBar: {
      name: 'litrePerHourBar',
      label: 'litre per hour bar',
      symbol: 'l/(h·bar)',
      code: 'G83',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    litrePerHourKelvin: {
      name: 'litrePerHourKelvin',
      label: 'litre per hour kelvin',
      symbol: 'l/(h·K)',
      code: 'G66',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    litrePerKelvin: {
      name: 'litrePerKelvin',
      label: 'litre per kelvin',
      symbol: 'l/K',
      code: 'G28',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumePerTemperature']
    },
    litrePerKilogram: {
      name: 'litrePerKilogram',
      label: 'litre per kilogram',
      symbol: 'l/kg',
      code: 'H83',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificVolume', 'massicVolume']
    },
    litrePerLitre: {
      name: 'litrePerLitre',
      label: 'litre per litre',
      symbol: 'l/l',
      code: 'K62',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeRatio']
    },
    litrePerMinute: {
      name: 'litrePerMinute',
      label: 'litre per minute',
      symbol: 'l/min',
      code: 'L2',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.66667 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    litrePerMinuteBar: {
      name: 'litrePerMinuteBar',
      label: 'litre per minute bar',
      symbol: 'l/(min·bar)',
      code: 'G84',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    litrePerMinuteKelvin: {
      name: 'litrePerMinuteKelvin',
      label: 'litre per minute kelvin',
      symbol: 'l/(min·K)',
      code: 'G67',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    litrePerMole: {
      name: 'litrePerMole',
      label: 'litre per mole',
      symbol: 'l/mol',
      code: 'B58',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerMole'];
      },
      conversionFactor: '10⁻³ m³/mol',
      quantityKinds: ['molarVolume', 'molarVolume']
    },
    litrePerSecond: {
      name: 'litrePerSecond',
      label: 'litre per second',
      symbol: 'l/s',
      code: 'G51',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    litrePerSecondBar: {
      name: 'litrePerSecondBar',
      label: 'litre per second bar',
      symbol: 'l/(s·bar)',
      code: 'G85',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    litrePerSecondKelvin: {
      name: 'litrePerSecondKelvin',
      label: 'litre per second kelvin',
      symbol: 'l/(s·K)',
      code: 'G68',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    load: {
      name: 'load',
      label: 'load',
      symbol: null,
      code: 'NL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lotUnitOfProcurement: {
      name: 'lotUnitOfProcurement',
      label: 'lot  [unit of procurement]',
      symbol: null,
      code: 'LO',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lotUnitOfWeight: {
      name: 'lotUnitOfWeight',
      label: 'lot  [unit of weight]',
      symbol: null,
      code: 'D04',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lumen: {
      name: 'lumen',
      label: 'lumen',
      symbol: 'lm',
      code: 'LUM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['luminousFlux']
    },
    lumenHour: {
      name: 'lumenHour',
      label: 'lumen hour',
      symbol: 'lm·h',
      code: 'B59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['quantityOfLight']
    },
    lumenPerSquareFoot: {
      name: 'lumenPerSquareFoot',
      label: 'lumen per square foot',
      symbol: 'lm/ft²',
      code: 'P25',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['illuminance']
    },
    lumenPerSquareMetre: {
      name: 'lumenPerSquareMetre',
      label: 'lumen per square metre',
      symbol: 'lm/m²',
      code: 'B60',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['luminousExitance']
    },
    lumenPerWatt: {
      name: 'lumenPerWatt',
      label: 'lumen per watt',
      symbol: 'lm/W',
      code: 'B61',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'spectralLuminousEfficacy',
        'luminiousEfficacy',
        'luminousEfficacyAtASpecifiedWavelength',
        'maximumSpectralLuminousEfficacy'
      ]
    },
    lumenSecond: {
      name: 'lumenSecond',
      label: 'lumen second',
      symbol: 'lm·s',
      code: 'B62',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['quantityOfLight']
    },
    lumpSum: {
      name: 'lumpSum',
      label: 'lump sum',
      symbol: null,
      code: 'LS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    lux: {
      name: 'lux',
      label: 'lux',
      symbol: 'lx',
      code: 'LUX',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['illuminance']
    },
    luxHour: {
      name: 'luxHour',
      label: 'lux hour',
      symbol: 'lx·h',
      code: 'B63',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['lightExposure']
    },
    luxSecond: {
      name: 'luxSecond',
      label: 'lux second',
      symbol: 'lx·s',
      code: 'B64',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['lightExposure']
    },
    manmonth: {
      name: 'manmonth',
      label: 'manmonth',
      symbol: null,
      code: '3C',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    meal: {
      name: 'meal',
      label: 'meal',
      symbol: null,
      code: 'Q3',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    mebibit: {
      name: 'mebibit',
      label: 'mebibit',
      symbol: 'Mibit',
      code: 'D11',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    mebibitPerCubicMetre: {
      name: 'mebibitPerCubicMetre',
      label: 'mebibit per cubic metre',
      symbol: 'Mibit/m³',
      code: 'E77',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    mebibitPerMetre: {
      name: 'mebibitPerMetre',
      label: 'mebibit per metre',
      symbol: 'Mibit/m',
      code: 'E75',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    mebibitPerSquareMetre: {
      name: 'mebibitPerSquareMetre',
      label: 'mebibit per square metre',
      symbol: 'Mibit/m²',
      code: 'E76',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    mebibyte: {
      name: 'mebibyte',
      label: 'mebibyte',
      symbol: 'Mibyte',
      code: 'E63',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '2²⁰ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    megaampere: {
      name: 'megaampere',
      label: 'megaampere',
      symbol: 'MA',
      code: 'H38',
      referenceUnit: function () {
        return sammUDefinition.units['ampere'];
      },
      conversionFactor: '10⁶ A',
      quantityKinds: [
        'electricCurrent',
        'magneticPotentialDifference',
        'currentLinkage',
        'magnetomotiveForce',
        'magneticPotentialDifference',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent'
      ]
    },
    megaamperePerSquareMetre: {
      name: 'megaamperePerSquareMetre',
      label: 'megaampere per square metre',
      symbol: 'MA/m²',
      code: 'B66',
      referenceUnit: function () {
        return sammUDefinition.units['amperePerSquareMetre'];
      },
      conversionFactor: '10⁶ A/m²',
      quantityKinds: ['currentDensity', 'currentDensity']
    },
    megabaud: {
      name: 'megabaud',
      label: 'megabaud',
      symbol: 'MBd',
      code: 'J54',
      referenceUnit: function () {
        return sammUDefinition.units['baud'];
      },
      conversionFactor: '10⁶ Bd',
      quantityKinds: null
    },
    megabecquerel: {
      name: 'megabecquerel',
      label: 'megabecquerel',
      symbol: 'MBq',
      code: '4N',
      referenceUnit: function () {
        return sammUDefinition.units['becquerel'];
      },
      conversionFactor: '10⁶ Bq',
      quantityKinds: ['activity', 'activity']
    },
    megabecquerelPerKilogram: {
      name: 'megabecquerelPerKilogram',
      label: 'megabecquerel per kilogram',
      symbol: 'MBq/kg',
      code: 'B67',
      referenceUnit: function () {
        return sammUDefinition.units['becquerelPerKilogram'];
      },
      conversionFactor: '10⁶ Bq/kg',
      quantityKinds: ['specificActivityInASample', 'specificActivityInASample']
    },
    megabit: {
      name: 'megabit',
      label: 'megabit',
      symbol: 'Mbit',
      code: 'D36',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    megabitPerSecond: {
      name: 'megabitPerSecond',
      label: 'megabit per second',
      symbol: 'Mbit/s',
      code: 'E20',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    megabyte: {
      name: 'megabyte',
      label: 'Megabyte',
      symbol: 'MB',
      code: '4L',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '10⁶ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    megabytePerSecond: {
      name: 'megabytePerSecond',
      label: 'megabyte per second',
      symbol: 'Mbyte/s',
      code: 'P95',
      referenceUnit: function () {
        return sammUDefinition.units['bytePerSecond'];
      },
      conversionFactor: '10⁶ byte/s',
      quantityKinds: null
    },
    megacoulomb: {
      name: 'megacoulomb',
      label: 'megacoulomb',
      symbol: 'MC',
      code: 'D77',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '10⁶ C',
      quantityKinds: [
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'quantityOfElectricity'
      ]
    },
    megacoulombPerCubicMetre: {
      name: 'megacoulombPerCubicMetre',
      label: 'megacoulomb per cubic metre',
      symbol: 'MC/m³',
      code: 'B69',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerCubicMetre'];
      },
      conversionFactor: '10⁶ C/m³',
      quantityKinds: ['chargeDensity', 'volumicCharge', 'volumeDensityOfCharge', 'volumicCharge', 'volumeDensityOfCharge', 'chargeDensity']
    },
    megacoulombPerSquareMetre: {
      name: 'megacoulombPerSquareMetre',
      label: 'megacoulomb per square metre',
      symbol: 'MC/m²',
      code: 'B70',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerSquareMetre'];
      },
      conversionFactor: '10⁶ C/m²',
      quantityKinds: [
        'surfaceDensityOfCharge',
        'electricFluxDensity',
        'displacementElectricPolarization',
        'surfaceDensityOfCharge',
        'electricFluxDensity',
        'displacementElectricPolarization'
      ]
    },
    megaelectronvolt: {
      name: 'megaelectronvolt',
      label: 'megaelectronvolt',
      symbol: 'MeV',
      code: 'B71',
      referenceUnit: function () {
        return sammUDefinition.units['electronvolt'];
      },
      conversionFactor: '10⁶ eV',
      quantityKinds: [
        'work',
        'energy',
        'kineticEnergy',
        'potentialEnergy',
        'work',
        'kineticEnergy',
        'betaDisintegrationEnergy',
        'resonanceEnergy',
        'potentialEnergy',
        'energy',
        'fermiEnergy',
        'maximumBetaParticleEnergy'
      ]
    },
    megagram: {
      name: 'megagram',
      label: 'megagram',
      symbol: 'Mg',
      code: '2U',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10³ kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    megagramPerCubicMetre: {
      name: 'megagramPerCubicMetre',
      label: 'megagram per cubic metre',
      symbol: 'Mg/m³',
      code: 'B72',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10³ kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'volumicMass',
        'density',
        'massDensity'
      ]
    },
    megahertz: {
      name: 'megahertz',
      label: 'megahertz',
      symbol: 'MHz',
      code: 'MHZ',
      referenceUnit: function () {
        return sammUDefinition.units['hertz'];
      },
      conversionFactor: '10⁶ Hz',
      quantityKinds: ['frequency', 'frequency']
    },
    megahertzKilometre: {
      name: 'megahertzKilometre',
      label: 'megahertz kilometre',
      symbol: 'MHz·km',
      code: 'H39',
      referenceUnit: function () {
        return sammUDefinition.units['hertzMetre'];
      },
      conversionFactor: '10⁹ Hz × m',
      quantityKinds: ['performanceCharacteristic', 'coefficient', 'coefficient', 'performanceCharacteristic']
    },
    megahertzMetre: {
      name: 'megahertzMetre',
      label: 'megahertz metre',
      symbol: 'MHz·m',
      code: 'M27',
      referenceUnit: function () {
        return sammUDefinition.units['hertzMetre'];
      },
      conversionFactor: '10⁶ Hz × m',
      quantityKinds: ['performanceCharacteristic', 'coefficient', 'performanceCharacteristic', 'coefficient']
    },
    megajoule: {
      name: 'megajoule',
      label: 'megajoule',
      symbol: 'MJ',
      code: '3B',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10⁶ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'potentialEnergy',
        'energy',
        'kineticEnergy'
      ]
    },
    megajoulePerCubicMetre: {
      name: 'megajoulePerCubicMetre',
      label: 'megajoule per cubic metre',
      symbol: 'MJ/m³',
      code: 'JM',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerCubicMetre'];
      },
      conversionFactor: '10⁶ J/m³',
      quantityKinds: [
        'radiantEnergyDensity',
        'electromagneticEnergyDensity',
        'volumicElectromagneticEnergy',
        'soundEnergy',
        'soundEnergyDensity',
        'volumic',
        'radiantEnergyDensity'
      ]
    },
    megajoulePerKilogram: {
      name: 'megajoulePerKilogram',
      label: 'megajoule per kilogram',
      symbol: 'MJ/kg',
      code: 'JK',
      referenceUnit: function () {
        return sammUDefinition.units['joulePerKilogram'];
      },
      conversionFactor: '10⁶ J/kg',
      quantityKinds: ['specificThermodynamicEnergy', 'specificEnergy', 'massicEnergy']
    },
    megajoulePerSecond: {
      name: 'megajoulePerSecond',
      label: 'megajoule per second',
      symbol: 'MJ/s',
      code: 'D78',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    megalitre: {
      name: 'megalitre',
      label: 'megalitre',
      symbol: 'Ml',
      code: 'MAL',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    megametre: {
      name: 'megametre',
      label: 'megametre',
      symbol: 'Mm',
      code: 'MAM',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁶ m',
      quantityKinds: [
        'lengthOfPath',
        'length',
        'height',
        'radiusOfCurvature',
        'diameter',
        'thickness',
        'radius',
        'breadth',
        'cartesianCoordinates',
        'distance',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    meganewton: {
      name: 'meganewton',
      label: 'meganewton',
      symbol: 'MN',
      code: 'B73',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '10⁶ N',
      quantityKinds: ['force', 'weight', 'weight', 'force']
    },
    meganewtonMetre: {
      name: 'meganewtonMetre',
      label: 'meganewton metre',
      symbol: 'MN·m',
      code: 'B74',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '10⁶ N × m',
      quantityKinds: ['momentOfACouple', 'torque', 'momentOfForce', 'torque', 'momentOfForce', 'momentOfACouple']
    },
    megaohm: {
      name: 'megaohm',
      label: 'megaohm',
      symbol: 'MΩ',
      code: 'B75',
      referenceUnit: function () {
        return sammUDefinition.units['ohm'];
      },
      conversionFactor: '10⁶ Ω',
      quantityKinds: [
        'modulusOfImpedance',
        'resistanceToDirectCurrent',
        'impedance',
        'complexImpedances',
        'resistanceToAlternatingCurrent',
        'reactance',
        'modulusOfImpedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'impedance',
        'resistanceToDirectCurrent'
      ]
    },
    megaohmKilometre: {
      name: 'megaohmKilometre',
      label: 'megaohm kilometre',
      symbol: 'MΩ·km',
      code: 'H88',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '10⁹ Ω × m',
      quantityKinds: ['resistivity', 'resistivity', 'residualResistivity']
    },
    megaohmMetre: {
      name: 'megaohmMetre',
      label: 'megaohm metre',
      symbol: 'MΩ·m',
      code: 'B76',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '10⁶ Ω × m',
      quantityKinds: ['resistivity', 'residualResistivity', 'resistivity']
    },
    megaohmPerKilometre: {
      name: 'megaohmPerKilometre',
      label: 'megaohm per kilometre',
      symbol: 'MΩ/km',
      code: 'H36',
      referenceUnit: function () {
        return sammUDefinition.units['ohmPerMetre'];
      },
      conversionFactor: '10³ Ω/m',
      quantityKinds: ['lineicResistance', 'lineicResistance']
    },
    megaohmPerMetre: {
      name: 'megaohmPerMetre',
      label: 'megaohm per metre',
      symbol: 'MΩ/m',
      code: 'H37',
      referenceUnit: function () {
        return sammUDefinition.units['ohmPerMetre'];
      },
      conversionFactor: '10⁶ Ω/m',
      quantityKinds: ['lineicResistance', 'lineicResistance']
    },
    megapascal: {
      name: 'megapascal',
      label: 'megapascal',
      symbol: 'MPa',
      code: 'MPA',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁶ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'bulkModulus',
        'normalStress',
        'shearModulus',
        'pressure',
        'modulusOfElasticity',
        'shearStress',
        'modulusOfCompression',
        'modulusOfRigidity'
      ]
    },
    megapascalCubicMetrePerSecond: {
      name: 'megapascalCubicMetrePerSecond',
      label: 'megapascal cubic metre per second',
      symbol: 'MPa·m³/s',
      code: 'F98',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'modulusOfCompression',
        'modulusOfRigidity',
        'normalStress',
        'shearStress',
        'shearModulus',
        'bulkModulus',
        'modulusOfElasticity',
        'pressure'
      ]
    },
    megapascalLitrePerSecond: {
      name: 'megapascalLitrePerSecond',
      label: 'megapascal litre per second',
      symbol: 'MPa·l/s',
      code: 'F97',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'shearModulus',
        'normalStress',
        'pressure',
        'modulusOfCompression',
        'shearStress',
        'modulusOfRigidity',
        'modulusOfElasticity',
        'bulkModulus'
      ]
    },
    megapascalPerBar: {
      name: 'megapascalPerBar',
      label: 'megapascal per bar',
      symbol: 'MPa/bar',
      code: 'F05',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureRatio']
    },
    megapascalPerKelvin: {
      name: 'megapascalPerKelvin',
      label: 'megapascal per kelvin',
      symbol: 'MPa/K',
      code: 'F85',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'shearStress',
        'shearModulus',
        'modulusOfRigidity',
        'bulkModulus',
        'modulusOfElasticity',
        'pressure',
        'modulusOfCompression',
        'normalStress'
      ]
    },
    megapixel: {
      name: 'megapixel',
      label: 'megapixel',
      symbol: null,
      code: 'E38',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    megasiemensPerMetre: {
      name: 'megasiemensPerMetre',
      label: 'megasiemens per metre',
      symbol: 'MS/m',
      code: 'B77',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10⁶ S/m',
      quantityKinds: ['electrolyticConductivity', 'conductivity', 'conductivity']
    },
    megavar: {
      name: 'megavar',
      label: 'megavar',
      symbol: 'kvar',
      code: 'MAR',
      referenceUnit: function () {
        return sammUDefinition.units['voltAmpere'];
      },
      conversionFactor: '10³ V × A',
      quantityKinds: ['reactivePower', 'apparentPower']
    },
    megavolt: {
      name: 'megavolt',
      label: 'megavolt',
      symbol: 'MV',
      code: 'B78',
      referenceUnit: function () {
        return sammUDefinition.units['volt'];
      },
      conversionFactor: '10⁶ V',
      quantityKinds: [
        'potentialDifference',
        'tension',
        'electricPotential',
        'voltage',
        'electromotiveForce',
        'thermoelectromotiveForceBetweenSubstancesAAndB',
        'electricPotential',
        'peltierCoefficientForSubstancesAAndB',
        'electromotiveForce',
        'potentialDifference',
        'tension',
        'voltage'
      ]
    },
    megavoltAmpere: {
      name: 'megavoltAmpere',
      label: 'megavolt - ampere',
      symbol: 'MV·A',
      code: 'MVA',
      referenceUnit: function () {
        return sammUDefinition.units['voltAmpere'];
      },
      conversionFactor: '10⁶ V × A',
      quantityKinds: ['apparentPower', 'apparentPower']
    },
    megavoltAmpereReactiveHour: {
      name: 'megavoltAmpereReactiveHour',
      label: 'megavolt ampere reactive hour',
      symbol: 'Mvar·h',
      code: 'MAH',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    megavoltPerMetre: {
      name: 'megavoltPerMetre',
      label: 'megavolt per metre',
      symbol: 'MV/m',
      code: 'B79',
      referenceUnit: function () {
        return sammUDefinition.units['voltPerMetre'];
      },
      conversionFactor: '10⁶ V/m',
      quantityKinds: ['electricFieldStrength', 'electricFieldStrength']
    },
    megawatt: {
      name: 'megawatt',
      label: 'megawatt',
      symbol: 'MW',
      code: 'MAW',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10⁶ W',
      quantityKinds: [
        'activePower',
        'powerForDirectCurrent',
        'power',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    megawattHour1000Kwh: {
      name: 'megawattHour1000Kwh',
      label: 'megawatt hour (1000 kW.h)',
      symbol: 'MW·h',
      code: 'MWH',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '3.6 × 10⁹ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'kineticEnergy',
        'potentialEnergy',
        'energy'
      ]
    },
    megawattHourPerHour: {
      name: 'megawattHourPerHour',
      label: 'megawatt hour per hour',
      symbol: 'MW·h/h',
      code: 'E07',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    megawattPerHertz: {
      name: 'megawattPerHertz',
      label: 'megawatt per hertz',
      symbol: 'MW/Hz',
      code: 'E08',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    mesh: {
      name: 'mesh',
      label: 'mesh',
      symbol: null,
      code: '57',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    message: {
      name: 'message',
      label: 'message',
      symbol: null,
      code: 'NF',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    metre: {
      name: 'metre',
      label: 'metre',
      symbol: 'm',
      code: 'MTR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    metreKelvin: {
      name: 'metreKelvin',
      label: 'metre kelvin',
      symbol: 'm·K',
      code: 'D18',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['secondRadiationConstant']
    },
    metrePerBar: {
      name: 'metrePerBar',
      label: 'metre per bar',
      symbol: 'm/bar',
      code: 'G05',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'height',
        'radiusOfCurvature',
        'breadth',
        'length',
        'lengthOfPath',
        'radius',
        'diameter',
        'cartesianCoordinates',
        'thickness',
        'distance'
      ]
    },
    metrePerDegreeCelsiusMetre: {
      name: 'metrePerDegreeCelsiusMetre',
      label: 'metre per degree Celsius metre',
      symbol: 'm/(°C·m)',
      code: 'N83',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalKelvinOrKelvinToThePowerMinusOne'];
      },
      conversionFactor: 'K⁻¹',
      quantityKinds: ['thermalDiffusivity', 'relativePressureCoefficient', 'linearExpansionCoefficient', 'cubicExpansionCoefficient']
    },
    metrePerHour: {
      name: 'metrePerHour',
      label: 'metre per hour',
      symbol: 'm/h',
      code: 'M60',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'phaseVelocity',
        'groupVelocity',
        'velocity'
      ]
    },
    metrePerKelvin: {
      name: 'metrePerKelvin',
      label: 'metre per kelvin',
      symbol: 'm/K',
      code: 'F52',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'distance',
        'diameter',
        'height',
        'thickness',
        'length',
        'cartesianCoordinates',
        'lengthOfPath',
        'radiusOfCurvature',
        'radius',
        'breadth'
      ]
    },
    metrePerMinute: {
      name: 'metrePerMinute',
      label: 'metre per minute',
      symbol: 'm/min',
      code: '2X',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '0.016666 m/s',
      quantityKinds: [
        'phaseVelocity',
        'velocity',
        'groupVelocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    metrePerPascal: {
      name: 'metrePerPascal',
      label: 'metre per pascal',
      symbol: 'm/Pa',
      code: 'M53',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'lengthOfPath',
        'radiusOfCurvature',
        'distance',
        'radius',
        'thickness',
        'cartesianCoordinates',
        'diameter',
        'breadth',
        'length',
        'height'
      ]
    },
    metrePerRadiant: {
      name: 'metrePerRadiant',
      label: 'metre per radiant',
      symbol: 'm/rad',
      code: 'M55',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['solidAngle']
    },
    metrePerSecond: {
      name: 'metrePerSecond',
      label: 'metre per second',
      symbol: 'm/s',
      code: 'MTS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    metrePerSecondBar: {
      name: 'metrePerSecondBar',
      label: 'metre per second bar',
      symbol: '(m/s)/bar',
      code: 'L13',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondPascal'];
      },
      conversionFactor: '10⁻⁵ (m/s)/Pa',
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity', 'groupVelocity', 'velocity', 'phaseVelocity']
    },
    metrePerSecondKelvin: {
      name: 'metrePerSecondKelvin',
      label: 'metre per second kelvin',
      symbol: '(m/s)/K',
      code: 'L12',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity']
    },
    metrePerSecondPascal: {
      name: 'metrePerSecondPascal',
      label: 'metre per second pascal',
      symbol: '(m/s)/Pa',
      code: 'M59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity']
    },
    metrePerSecondSquared: {
      name: 'metrePerSecondSquared',
      label: 'metre per second squared',
      symbol: 'm/s²',
      code: 'MSK',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['accelerationDueToGravity', 'accelerationOfFreeFall', 'instantaneousSoundParticleAcceleration', 'acceleration']
    },
    metrePerVoltSecond: {
      name: 'metrePerVoltSecond',
      label: 'metre per volt second',
      symbol: 'm/(V·s)',
      code: 'H58',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['mobility']
    },
    metreToTheFourthPower: {
      name: 'metreToTheFourthPower',
      label: 'metre to the fourth power',
      symbol: 'm⁴',
      code: 'B83',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['secondMomentOfArea', 'secondAxialMomentOfArea']
    },
    metricCarat: {
      name: 'metricCarat',
      label: 'metric carat',
      symbol: null,
      code: 'CTM',
      referenceUnit: function () {
        return sammUDefinition.units['milligram'];
      },
      conversionFactor: '200 mg',
      quantityKinds: ['mass']
    },
    metricTonIncludingContainer: {
      name: 'metricTonIncludingContainer',
      label: 'metric ton, including container',
      symbol: null,
      code: 'TIC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    metricTonIncludingInnerPackaging: {
      name: 'metricTonIncludingInnerPackaging',
      label: 'metric ton, including inner packaging',
      symbol: null,
      code: 'TIP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    metricTonLubricatingOil: {
      name: 'metricTonLubricatingOil',
      label: 'metric ton, lubricating oil',
      symbol: null,
      code: 'LUB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    microInch: {
      name: 'microInch',
      label: 'micro-inch',
      symbol: 'µin',
      code: 'M7',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '25.4 × 10⁻⁹ m',
      quantityKinds: [
        'lengthOfPath',
        'breadth',
        'radiusOfCurvature',
        'radius',
        'height',
        'length',
        'cartesianCoordinates',
        'diameter',
        'thickness',
        'distance',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    microampere: {
      name: 'microampere',
      label: 'microampere',
      symbol: 'µA',
      code: 'B84',
      referenceUnit: function () {
        return sammUDefinition.units['ampere'];
      },
      conversionFactor: '10⁻⁶ A',
      quantityKinds: [
        'electricCurrent',
        'magnetomotiveForce',
        'currentLinkage',
        'magneticPotentialDifference',
        'magneticPotentialDifference',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent'
      ]
    },
    microbar: {
      name: 'microbar',
      label: 'microbar',
      symbol: 'µbar',
      code: 'B85',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁻¹ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfElasticity',
        'shearStress',
        'pressure',
        'shearModulus',
        'modulusOfCompression',
        'bulkModulus',
        'normalStress',
        'modulusOfRigidity'
      ]
    },
    microbecquerel: {
      name: 'microbecquerel',
      label: 'microbecquerel',
      symbol: 'µBq',
      code: 'H08',
      referenceUnit: function () {
        return sammUDefinition.units['becquerel'];
      },
      conversionFactor: '10⁻⁶ Bq',
      quantityKinds: ['activity', 'activity']
    },
    microcoulomb: {
      name: 'microcoulomb',
      label: 'microcoulomb',
      symbol: 'µC',
      code: 'B86',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '10⁻⁶ C',
      quantityKinds: [
        'quantityOfElectricity',
        'electricCharge',
        'electricFluxFluxOfDisplacement',
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge'
      ]
    },
    microcoulombPerCubicMetre: {
      name: 'microcoulombPerCubicMetre',
      label: 'microcoulomb per cubic metre',
      symbol: 'µC/m³',
      code: 'B87',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerCubicMetre'];
      },
      conversionFactor: '10⁻⁶ C/m³',
      quantityKinds: ['volumicCharge', 'volumeDensityOfCharge', 'chargeDensity', 'chargeDensity', 'volumeDensityOfCharge', 'volumicCharge']
    },
    microcoulombPerSquareMetre: {
      name: 'microcoulombPerSquareMetre',
      label: 'microcoulomb per square metre',
      symbol: 'µC/m²',
      code: 'B88',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerSquareMetre'];
      },
      conversionFactor: '10⁻⁶ C/m²',
      quantityKinds: [
        'electricFluxDensity',
        'surfaceDensityOfCharge',
        'displacementElectricPolarization',
        'surfaceDensityOfCharge',
        'electricFluxDensity',
        'displacementElectricPolarization'
      ]
    },
    microcurie: {
      name: 'microcurie',
      label: 'microcurie',
      symbol: 'µCi',
      code: 'M5',
      referenceUnit: function () {
        return sammUDefinition.units['becquerel'];
      },
      conversionFactor: '3.7 × 10⁴ Bq',
      quantityKinds: ['activity', 'activity']
    },
    microfarad: {
      name: 'microfarad',
      label: 'microfarad',
      symbol: 'µF',
      code: '4O',
      referenceUnit: function () {
        return sammUDefinition.units['farad'];
      },
      conversionFactor: '10⁻⁶ F',
      quantityKinds: ['capacitance', 'capacitance']
    },
    microfaradPerKilometre: {
      name: 'microfaradPerKilometre',
      label: 'microfarad per kilometre',
      symbol: 'µF/km',
      code: 'H28',
      referenceUnit: function () {
        return sammUDefinition.units['faradPerMetre'];
      },
      conversionFactor: '10⁻⁹ F/m',
      quantityKinds: [
        'electricConstant',
        'permittivity',
        'permittivityOfVacuum',
        'permittivityOfVacuum',
        'permittivity',
        'electricConstant'
      ]
    },
    microfaradPerMetre: {
      name: 'microfaradPerMetre',
      label: 'microfarad per metre',
      symbol: 'µF/m',
      code: 'B89',
      referenceUnit: function () {
        return sammUDefinition.units['faradPerMetre'];
      },
      conversionFactor: '10⁻⁶ F/m',
      quantityKinds: [
        'permittivityOfVacuum',
        'permittivity',
        'electricConstant',
        'electricConstant',
        'permittivityOfVacuum',
        'permittivity'
      ]
    },
    microgram: {
      name: 'microgram',
      label: 'microgram',
      symbol: 'µg',
      code: 'MC',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10⁻⁹ kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass', 'mass']
    },
    microgramPerCubicMetre: {
      name: 'microgramPerCubicMetre',
      label: 'microgram per cubic metre',
      symbol: 'µg/m³',
      code: 'GQ',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10⁻⁹ kg/m³',
      quantityKinds: [
        'density',
        'massDensity',
        'volumicMass',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    microgramPerCubicMetreBar: {
      name: 'microgramPerCubicMetreBar',
      label: 'microgram per cubic metre bar',
      symbol: '(µg/m³)/bar',
      code: 'J35',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetrePascal'];
      },
      conversionFactor: '10⁻¹⁴ (kg/m³)/Pa',
      quantityKinds: ['volumicMass', 'massDensity', 'density', 'massDensity', 'volumicMass', 'density']
    },
    microgramPerCubicMetreKelvin: {
      name: 'microgramPerCubicMetreKelvin',
      label: 'microgram per cubic metre kelvin',
      symbol: '(µg/m³)/K',
      code: 'J34',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    microgramPerKilogram: {
      name: 'microgramPerKilogram',
      label: 'microgram per kilogram',
      symbol: 'µg/kg',
      code: 'J33',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massRatio']
    },
    microgramPerLitre: {
      name: 'microgramPerLitre',
      label: 'microgram per litre',
      symbol: 'µg/l',
      code: 'H29',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    micrograyPerHour: {
      name: 'micrograyPerHour',
      label: 'microgray per hour',
      symbol: 'µGy/h',
      code: 'P63',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻¹⁰ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    micrograyPerMinute: {
      name: 'micrograyPerMinute',
      label: 'microgray per minute',
      symbol: 'µGy/min',
      code: 'P59',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '1.66667 × 10⁻⁸ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    micrograyPerSecond: {
      name: 'micrograyPerSecond',
      label: 'microgray per second',
      symbol: 'µGy/s',
      code: 'P55',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '10⁻⁶ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    microhenry: {
      name: 'microhenry',
      label: 'microhenry',
      symbol: 'µH',
      code: 'B90',
      referenceUnit: function () {
        return sammUDefinition.units['henry'];
      },
      conversionFactor: '10⁻⁶ H',
      quantityKinds: ['selfInductance', 'mutualInductance', 'permeance', 'selfInductance', 'permeance', 'mutualInductance']
    },
    microhenryPerKiloohm: {
      name: 'microhenryPerKiloohm',
      label: 'microhenry per kiloohm',
      symbol: 'µH/kΩ',
      code: 'G98',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁹ s',
      quantityKinds: [
        'mutualInductance',
        'permeance',
        'selfInductance',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    microhenryPerMetre: {
      name: 'microhenryPerMetre',
      label: 'microhenry per metre',
      symbol: 'µH/m',
      code: 'B91',
      referenceUnit: function () {
        return sammUDefinition.units['henryPerMetre'];
      },
      conversionFactor: '10⁻⁶ H/m',
      quantityKinds: [
        'magneticConstant',
        'permeabilityOfVacuum',
        'permeability',
        'permeabilityOfVacuum',
        'permeability',
        'magneticConstant'
      ]
    },
    microhenryPerOhm: {
      name: 'microhenryPerOhm',
      label: 'microhenry per ohm',
      symbol: 'µH/Ω',
      code: 'G99',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁶ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'permeance',
        'mutualInductance',
        'selfInductance'
      ]
    },
    microlitre: {
      name: 'microlitre',
      label: 'microlitre',
      symbol: 'µl',
      code: '4G',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻⁹ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    microlitrePerLitre: {
      name: 'microlitrePerLitre',
      label: 'microlitre per litre',
      symbol: 'µl/l',
      code: 'J36',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeRatio']
    },
    micrometreMicron: {
      name: 'micrometreMicron',
      label: 'micrometre (micron)',
      symbol: 'µm',
      code: '4H',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁻⁶ m',
      quantityKinds: [
        'length',
        'radius',
        'radiusOfCurvature',
        'thickness',
        'height',
        'distance',
        'lengthOfPath',
        'cartesianCoordinates',
        'breadth',
        'diameter',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    micrometrePerKelvin: {
      name: 'micrometrePerKelvin',
      label: 'micrometre per kelvin',
      symbol: 'µm/K',
      code: 'F50',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'diameter',
        'distance',
        'lengthOfPath',
        'breadth',
        'thickness',
        'height',
        'radiusOfCurvature',
        'length',
        'cartesianCoordinates',
        'radius'
      ]
    },
    micromole: {
      name: 'micromole',
      label: 'micromole',
      symbol: 'µmol',
      code: 'FH',
      referenceUnit: function () {
        return sammUDefinition.units['mole'];
      },
      conversionFactor: '10⁻⁶ mol',
      quantityKinds: ['amountOfSubstance', 'amountOfSubstance']
    },
    micronewton: {
      name: 'micronewton',
      label: 'micronewton',
      symbol: 'µN',
      code: 'B92',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '10⁻⁶ N',
      quantityKinds: ['force', 'weight', 'weight', 'force']
    },
    micronewtonMetre: {
      name: 'micronewtonMetre',
      label: 'micronewton metre',
      symbol: 'µN·m',
      code: 'B93',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '10⁻⁶ N × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple', 'momentOfForce', 'torque', 'momentOfACouple']
    },
    microohm: {
      name: 'microohm',
      label: 'microohm',
      symbol: 'µΩ',
      code: 'B94',
      referenceUnit: function () {
        return sammUDefinition.units['ohm'];
      },
      conversionFactor: '10⁻⁶ Ω',
      quantityKinds: [
        'reactance',
        'impedance',
        'resistanceToDirectCurrent',
        'modulusOfImpedance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'modulusOfImpedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'impedance',
        'resistanceToDirectCurrent'
      ]
    },
    microohmMetre: {
      name: 'microohmMetre',
      label: 'microohm metre',
      symbol: 'µΩ·m',
      code: 'B95',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '10⁻⁶ Ω × m',
      quantityKinds: ['resistivity', 'residualResistivity', 'resistivity']
    },
    micropascal: {
      name: 'micropascal',
      label: 'micropascal',
      symbol: 'µPa',
      code: 'B96',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁻⁶ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'pressure',
        'modulusOfRigidity',
        'bulkModulus',
        'normalStress',
        'modulusOfElasticity',
        'shearStress',
        'modulusOfCompression',
        'shearModulus'
      ]
    },
    micropoise: {
      name: 'micropoise',
      label: 'micropoise',
      symbol: 'µP',
      code: 'J32',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '10⁻⁶ Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    microradian: {
      name: 'microradian',
      label: 'microradian',
      symbol: 'µrad',
      code: 'B97',
      referenceUnit: function () {
        return sammUDefinition.units['rad'];
      },
      conversionFactor: '10⁻⁶ rad',
      quantityKinds: ['absorbedDose', 'anglePlane']
    },
    microsecond: {
      name: 'microsecond',
      label: 'microsecond',
      symbol: 'µs',
      code: 'B98',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁶ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'time'
      ]
    },
    microsiemens: {
      name: 'microsiemens',
      label: 'microsiemens',
      symbol: 'µS',
      code: 'B99',
      referenceUnit: function () {
        return sammUDefinition.units['siemens'];
      },
      conversionFactor: '10⁻⁶ S',
      quantityKinds: [
        'admittance',
        'modulusOfAdmittance',
        'conductanceForAlternatingCurrent',
        'conductanceForDirectCurrent',
        'complexAdmittance',
        'modulusOfAdmittance',
        'admittance',
        'complexAdmittance',
        'conductanceForAlternatingCurrent',
        'conductanceForDirectCurrent'
      ]
    },
    microsiemensPerCentimetre: {
      name: 'microsiemensPerCentimetre',
      label: 'microsiemens per centimetre',
      symbol: 'µS/cm',
      code: 'G42',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10⁻⁴ S/m',
      quantityKinds: [
        'conductanceForDirectCurrent',
        'modulusOfAdmittance',
        'conductanceForAlternatingCurrent',
        'admittance',
        'complexAdmittance',
        'electrolyticConductivity',
        'conductivity'
      ]
    },
    microsiemensPerMetre: {
      name: 'microsiemensPerMetre',
      label: 'microsiemens per metre',
      symbol: 'µS/m',
      code: 'G43',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10⁻⁶ S/m',
      quantityKinds: [
        'electrolyticConductivity',
        'conductivity',
        'conductanceForDirectCurrent',
        'complexAdmittance',
        'modulusOfAdmittance',
        'conductanceForAlternatingCurrent',
        'admittance'
      ]
    },
    microsievertPerHour: {
      name: 'microsievertPerHour',
      label: 'microsievert per hour',
      symbol: 'µSv/h',
      code: 'P72',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '0.277777778 × 10⁻¹⁰ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    microsievertPerMinute: {
      name: 'microsievertPerMinute',
      label: 'microsievert per minute',
      symbol: 'µSv/min',
      code: 'P76',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '1.666666667 × 10⁻⁸ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    microsievertPerSecond: {
      name: 'microsievertPerSecond',
      label: 'microsievert per second',
      symbol: 'µSv/s',
      code: 'P67',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '10⁻⁶ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    microtesla: {
      name: 'microtesla',
      label: 'microtesla',
      symbol: 'µT',
      code: 'D81',
      referenceUnit: function () {
        return sammUDefinition.units['tesla'];
      },
      conversionFactor: '10⁻⁶ T',
      quantityKinds: [
        'magneticPolarization',
        'lowerCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticInduction',
        'thermodynamicCriticalMagneticFluxDensity',
        'upperCriticalMagneticFluxDensity',
        'magneticInduction',
        'magneticPolarization',
        'magneticFluxDensity'
      ]
    },
    microvolt: {
      name: 'microvolt',
      label: 'microvolt',
      symbol: 'µV',
      code: 'D82',
      referenceUnit: function () {
        return sammUDefinition.units['volt'];
      },
      conversionFactor: '10⁻⁶ V',
      quantityKinds: [
        'voltage',
        'electricPotential',
        'tension',
        'electromotiveForce',
        'potentialDifference',
        'thermoelectromotiveForceBetweenSubstancesAAndB',
        'electricPotential',
        'peltierCoefficientForSubstancesAAndB',
        'electromotiveForce',
        'potentialDifference',
        'tension',
        'voltage'
      ]
    },
    microvoltPerMetre: {
      name: 'microvoltPerMetre',
      label: 'microvolt per metre',
      symbol: 'µV/m',
      code: 'C3',
      referenceUnit: function () {
        return sammUDefinition.units['voltPerMetre'];
      },
      conversionFactor: '10⁻⁶ V/m',
      quantityKinds: ['electricFieldStrength', 'electricFieldStrength']
    },
    microwatt: {
      name: 'microwatt',
      label: 'microwatt',
      symbol: 'µW',
      code: 'D80',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10⁻⁶ W',
      quantityKinds: [
        'power',
        'powerForDirectCurrent',
        'activePower',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    microwattPerSquareMetre: {
      name: 'microwattPerSquareMetre',
      label: 'microwatt per square metre',
      symbol: 'µW/m²',
      code: 'D85',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '10⁻⁶ W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'soundIntensity'
      ]
    },
    mil: {
      name: 'mil',
      label: 'mil',
      symbol: 'mil',
      code: 'M43',
      referenceUnit: function () {
        return sammUDefinition.units['rad'];
      },
      conversionFactor: '9.817477 × 10⁻⁴ rad',
      quantityKinds: ['absorbedDose', 'anglePlane']
    },
    mileBasedOnUsSurveyFoot: {
      name: 'mileBasedOnUsSurveyFoot',
      label: 'mile (based on U.S. survey foot)',
      symbol: 'mi (US survey)',
      code: 'M52',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '1.609347 × 10³ m',
      quantityKinds: [
        'radius',
        'length',
        'thickness',
        'breadth',
        'distance',
        'diameter',
        'height',
        'lengthOfPath',
        'cartesianCoordinates',
        'radiusOfCurvature',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    milePerHourStatuteMile: {
      name: 'milePerHourStatuteMile',
      label: 'mile per hour (statute mile)',
      symbol: 'mile/h',
      code: 'HM',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '0.44704 m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'phaseVelocity',
        'groupVelocity',
        'velocity'
      ]
    },
    milePerMinute: {
      name: 'milePerMinute',
      label: 'mile per minute',
      symbol: 'mi/min',
      code: 'M57',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '26.8224 m/s',
      quantityKinds: [
        'phaseVelocity',
        'velocity',
        'groupVelocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    milePerSecond: {
      name: 'milePerSecond',
      label: 'mile per second',
      symbol: 'mi/s',
      code: 'M58',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '1.609344 × 10³ m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'phaseVelocity',
        'velocity',
        'groupVelocity'
      ]
    },
    mileStatuteMile: {
      name: 'mileStatuteMile',
      label: 'mile (statute mile)',
      symbol: 'mile',
      code: 'SMI',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '1609.344 m',
      quantityKinds: [
        'height',
        'breadth',
        'length',
        'lengthOfPath',
        'thickness',
        'cartesianCoordinates',
        'radius',
        'distance',
        'diameter',
        'radiusOfCurvature',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    mileStatuteMilePerSecondSquared: {
      name: 'mileStatuteMilePerSecondSquared',
      label: 'mile (statute mile) per second squared',
      symbol: 'mi/s²',
      code: 'M42',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '1.609344 × 10³ m/s²',
      quantityKinds: [
        'accelerationOfFreeFall',
        'acceleration',
        'accelerationDueToGravity',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    mille: {
      name: 'mille',
      label: 'mille',
      symbol: null,
      code: 'E12',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    milliInch: {
      name: 'milliInch',
      label: 'milli-inch',
      symbol: 'mil',
      code: '77',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '25.4 × 10⁻⁶ m',
      quantityKinds: [
        'lengthOfPath',
        'radius',
        'distance',
        'radiusOfCurvature',
        'length',
        'diameter',
        'height',
        'thickness',
        'cartesianCoordinates',
        'breadth',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    milliampere: {
      name: 'milliampere',
      label: 'milliampere',
      symbol: 'mA',
      code: '4K',
      referenceUnit: function () {
        return sammUDefinition.units['ampere'];
      },
      conversionFactor: '10⁻³ A',
      quantityKinds: [
        'magneticPotentialDifference',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent',
        'electricCurrent',
        'magnetomotiveForce',
        'currentLinkage',
        'magneticPotentialDifference'
      ]
    },
    milliampereHour: {
      name: 'milliampereHour',
      label: 'milliampere hour',
      symbol: 'mA·h',
      code: 'E09',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '3.6 C',
      quantityKinds: [
        'electricFluxFluxOfDisplacement',
        'quantityOfElectricity',
        'electricCharge',
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge'
      ]
    },
    milliamperePerBar: {
      name: 'milliamperePerBar',
      label: 'milliampere per bar',
      symbol: 'mA/bar',
      code: 'F59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticFieldStrength', 'lineicElectricCurrent', 'linearElectricCurrentDensity']
    },
    milliamperePerInch: {
      name: 'milliamperePerInch',
      label: 'milliampere per inch',
      symbol: 'mA/in',
      code: 'F08',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticFieldStrength', 'lineicElectricCurrent', 'linearElectricCurrentDensity']
    },
    milliamperePerLitreMinute: {
      name: 'milliamperePerLitreMinute',
      label: 'milliampere per litre minute',
      symbol: 'mA/(l·min)',
      code: 'G59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['currentDensity']
    },
    milliamperePerMillimetre: {
      name: 'milliamperePerMillimetre',
      label: 'milliampere per millimetre',
      symbol: 'mA/mm',
      code: 'F76',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticFieldStrength', 'lineicElectricCurrent', 'linearElectricCurrentDensity']
    },
    milliamperePerPoundForcePerSquareInch: {
      name: 'milliamperePerPoundForcePerSquareInch',
      label: 'milliampere per pound-force per square inch',
      symbol: 'mA/(lbf/in²)',
      code: 'F57',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['currentDensity']
    },
    milliard: {
      name: 'milliard',
      label: 'milliard',
      symbol: null,
      code: 'MLD',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    millibar: {
      name: 'millibar',
      label: 'millibar',
      symbol: 'mbar',
      code: 'MBR',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10² Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfCompression',
        'normalStress',
        'modulusOfElasticity',
        'pressure',
        'shearModulus',
        'shearStress',
        'modulusOfRigidity',
        'bulkModulus'
      ]
    },
    millibarCubicMetrePerSecond: {
      name: 'millibarCubicMetrePerSecond',
      label: 'millibar cubic metre per second',
      symbol: 'mbar·m³/s',
      code: 'F96',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'pressure',
        'shearStress',
        'modulusOfRigidity',
        'bulkModulus',
        'modulusOfElasticity',
        'normalStress',
        'modulusOfCompression',
        'shearModulus'
      ]
    },
    millibarLitrePerSecond: {
      name: 'millibarLitrePerSecond',
      label: 'millibar litre per second',
      symbol: 'mbar·l/s',
      code: 'F95',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'normalStress',
        'shearModulus',
        'modulusOfRigidity',
        'pressure',
        'shearStress',
        'modulusOfCompression',
        'bulkModulus',
        'modulusOfElasticity'
      ]
    },
    millibarPerBar: {
      name: 'millibarPerBar',
      label: 'millibar per bar',
      symbol: 'mbar/bar',
      code: 'F04',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureRatio']
    },
    millibarPerKelvin: {
      name: 'millibarPerKelvin',
      label: 'millibar per kelvin',
      symbol: 'mbar/K',
      code: 'F84',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'modulusOfRigidity',
        'shearModulus',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'modulusOfElasticity',
        'pressure',
        'modulusOfCompression'
      ]
    },
    millicandela: {
      name: 'millicandela',
      label: 'millicandela',
      symbol: 'mcd',
      code: 'P34',
      referenceUnit: function () {
        return sammUDefinition.units['candela'];
      },
      conversionFactor: '10⁻³ cd',
      quantityKinds: ['luminousIntensity', 'luminousIntensity']
    },
    millicoulomb: {
      name: 'millicoulomb',
      label: 'millicoulomb',
      symbol: 'mC',
      code: 'D86',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '10⁻³ C',
      quantityKinds: [
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge'
      ]
    },
    millicoulombPerCubicMetre: {
      name: 'millicoulombPerCubicMetre',
      label: 'millicoulomb per cubic metre',
      symbol: 'mC/m³',
      code: 'D88',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerCubicMetre'];
      },
      conversionFactor: '10⁻³ C/m³',
      quantityKinds: ['volumeDensityOfCharge', 'chargeDensity', 'volumicCharge', 'volumicCharge', 'volumeDensityOfCharge', 'chargeDensity']
    },
    millicoulombPerKilogram: {
      name: 'millicoulombPerKilogram',
      label: 'millicoulomb per kilogram',
      symbol: 'mC/kg',
      code: 'C8',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerKilogram'];
      },
      conversionFactor: '10⁻³ C/kg',
      quantityKinds: ['exposure', 'exposure']
    },
    millicoulombPerSquareMetre: {
      name: 'millicoulombPerSquareMetre',
      label: 'millicoulomb per square metre',
      symbol: 'mC/m²',
      code: 'D89',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerSquareMetre'];
      },
      conversionFactor: '10⁻³ C/m²',
      quantityKinds: [
        'surfaceDensityOfCharge',
        'electricFluxDensity',
        'displacementElectricPolarization',
        'displacementElectricPolarization',
        'surfaceDensityOfCharge',
        'electricFluxDensity'
      ]
    },
    millicurie: {
      name: 'millicurie',
      label: 'millicurie',
      symbol: 'mCi',
      code: 'MCU',
      referenceUnit: function () {
        return sammUDefinition.units['becquerel'];
      },
      conversionFactor: '3.7 × 10⁷ Bq',
      quantityKinds: ['activity', 'activity']
    },
    milliequivalenceCausticPotashPerGramOfProduct: {
      name: 'milliequivalenceCausticPotashPerGramOfProduct',
      label: 'milliequivalence caustic potash per gram of product',
      symbol: null,
      code: 'KO',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    millifarad: {
      name: 'millifarad',
      label: 'millifarad',
      symbol: 'mF',
      code: 'C10',
      referenceUnit: function () {
        return sammUDefinition.units['farad'];
      },
      conversionFactor: '10⁻³ F',
      quantityKinds: ['capacitance', 'capacitance']
    },
    milligal: {
      name: 'milligal',
      label: 'milligal',
      symbol: 'mGal',
      code: 'C11',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '10⁻⁵ m/s²',
      quantityKinds: [
        'accelerationOfFreeFall',
        'acceleration',
        'accelerationDueToGravity',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    milligram: {
      name: 'milligram',
      label: 'milligram',
      symbol: 'mg',
      code: 'MGM',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10⁻⁶ kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    milligramPerBar: {
      name: 'milligramPerBar',
      label: 'milligram per bar',
      symbol: 'mg/bar',
      code: 'F75',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    milligramPerCubicMetre: {
      name: 'milligramPerCubicMetre',
      label: 'milligram per cubic metre',
      symbol: 'mg/m³',
      code: 'GP',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10⁻⁶ kg/m³',
      quantityKinds: [
        'volumicMass',
        'massDensity',
        'density',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    milligramPerCubicMetreBar: {
      name: 'milligramPerCubicMetreBar',
      label: 'milligram per cubic metre bar',
      symbol: '(mg/m³)/bar',
      code: 'L18',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetrePascal'];
      },
      conversionFactor: '10⁻¹¹ (kg/m³)/Pa',
      quantityKinds: ['volumicMass', 'massDensity', 'density', 'volumicMass', 'massDensity', 'density']
    },
    milligramPerCubicMetreKelvin: {
      name: 'milligramPerCubicMetreKelvin',
      label: 'milligram per cubic metre kelvin',
      symbol: '(mg/m³)/K',
      code: 'L17',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    milligramPerDay: {
      name: 'milligramPerDay',
      label: 'milligram per day',
      symbol: 'mg/d',
      code: 'F32',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerDayBar: {
      name: 'milligramPerDayBar',
      label: 'milligram per day bar',
      symbol: 'mg/(d·bar)',
      code: 'F70',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerDayKelvin: {
      name: 'milligramPerDayKelvin',
      label: 'milligram per day kelvin',
      symbol: 'mg/(d·K)',
      code: 'F43',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerGram: {
      name: 'milligramPerGram',
      label: 'milligram per gram',
      symbol: 'mg/g',
      code: 'H64',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    milligramPerHour: {
      name: 'milligramPerHour',
      label: 'milligram per hour',
      symbol: 'mg/h',
      code: '4M',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻¹⁰ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    milligramPerHourBar: {
      name: 'milligramPerHourBar',
      label: 'milligram per hour bar',
      symbol: 'mg/(h·bar)',
      code: 'F71',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerHourKelvin: {
      name: 'milligramPerHourKelvin',
      label: 'milligram per hour kelvin',
      symbol: 'mg/(h·K)',
      code: 'F44',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerKelvin: {
      name: 'milligramPerKelvin',
      label: 'milligram per kelvin',
      symbol: 'mg/K',
      code: 'F16',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    milligramPerKilogram: {
      name: 'milligramPerKilogram',
      label: 'milligram per kilogram',
      symbol: 'mg/kg',
      code: 'NA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massRatio']
    },
    milligramPerLitre: {
      name: 'milligramPerLitre',
      label: 'milligram per litre',
      symbol: 'mg/l',
      code: 'M1',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10⁻³ kg/m³',
      quantityKinds: [
        'massDensity',
        'density',
        'volumicMass',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    milligramPerMetre: {
      name: 'milligramPerMetre',
      label: 'milligram per metre',
      symbol: 'mg/m',
      code: 'C12',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '10⁻⁶ kg/m',
      quantityKinds: ['linearMass', 'linearDensity', 'linearMass', 'linearDensity']
    },
    milligramPerMinute: {
      name: 'milligramPerMinute',
      label: 'milligram per minute',
      symbol: 'mg/min',
      code: 'F33',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerMinuteBar: {
      name: 'milligramPerMinuteBar',
      label: 'milligram per minute bar',
      symbol: 'mg/(min·bar)',
      code: 'F72',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerMinuteKelvin: {
      name: 'milligramPerMinuteKelvin',
      label: 'milligram per minute kelvin',
      symbol: 'mg/(min·K)',
      code: 'F45',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerSecond: {
      name: 'milligramPerSecond',
      label: 'milligram per second',
      symbol: 'mg/s',
      code: 'F34',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerSecondBar: {
      name: 'milligramPerSecondBar',
      label: 'milligram per second bar',
      symbol: 'mg/(s·bar)',
      code: 'F73',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerSecondKelvin: {
      name: 'milligramPerSecondKelvin',
      label: 'milligram per second kelvin',
      symbol: 'mg/(s·K)',
      code: 'F46',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    milligramPerSquareCentimetre: {
      name: 'milligramPerSquareCentimetre',
      label: 'milligram per square centimetre',
      symbol: 'mg/cm²',
      code: 'H63',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['surfaceDensity', 'areicMass']
    },
    milligramPerSquareMetre: {
      name: 'milligramPerSquareMetre',
      label: 'milligram per square metre',
      symbol: 'mg/m²',
      code: 'GO',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '10⁻⁶ kg/m²',
      quantityKinds: ['areicMass', 'surfaceDensity', 'surfaceDensity', 'meanMassRange', 'areicMass']
    },
    milligray: {
      name: 'milligray',
      label: 'milligray',
      symbol: 'mGy',
      code: 'C13',
      referenceUnit: function () {
        return sammUDefinition.units['gray'];
      },
      conversionFactor: '10⁻³ Gy',
      quantityKinds: ['specificEnergyImparted', 'massicEnergyImparted', 'massicEnergyImparted', 'specificEnergyImparted']
    },
    milligrayPerHour: {
      name: 'milligrayPerHour',
      label: 'milligray per hour',
      symbol: 'mGy/h',
      code: 'P62',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁷ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    milligrayPerMinute: {
      name: 'milligrayPerMinute',
      label: 'milligray per minute',
      symbol: 'mGy/min',
      code: 'P58',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '1.66667 × 10⁻⁵ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    milligrayPerSecond: {
      name: 'milligrayPerSecond',
      label: 'milligray per second',
      symbol: 'mGy/s',
      code: 'P54',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '10⁻³ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    millihenry: {
      name: 'millihenry',
      label: 'millihenry',
      symbol: 'mH',
      code: 'C14',
      referenceUnit: function () {
        return sammUDefinition.units['henry'];
      },
      conversionFactor: '10⁻³ H',
      quantityKinds: ['selfInductance', 'permeance', 'mutualInductance', 'selfInductance', 'permeance', 'mutualInductance']
    },
    millihenryPerKiloohm: {
      name: 'millihenryPerKiloohm',
      label: 'millihenry per kiloohm',
      symbol: 'mH/kΩ',
      code: 'H05',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁶ s',
      quantityKinds: [
        'selfInductance',
        'mutualInductance',
        'permeance',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    millihenryPerOhm: {
      name: 'millihenryPerOhm',
      label: 'millihenry per ohm',
      symbol: 'mH/Ω',
      code: 'H06',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻³ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'selfInductance',
        'mutualInductance',
        'permeance'
      ]
    },
    millijoule: {
      name: 'millijoule',
      label: 'millijoule',
      symbol: 'mJ',
      code: 'C15',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10⁻³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'work',
        'potentialEnergy',
        'kineticEnergy',
        'energy'
      ]
    },
    millilitre: {
      name: 'millilitre',
      label: 'millilitre',
      symbol: 'ml',
      code: 'MLT',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10⁻⁶ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    millilitrePerBar: {
      name: 'millilitrePerBar',
      label: 'millilitre per bar',
      symbol: 'ml/bar',
      code: 'G97',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volume']
    },
    millilitrePerCubicMetre: {
      name: 'millilitrePerCubicMetre',
      label: 'millilitre per cubic metre',
      symbol: 'ml/m³',
      code: 'H65',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificVolume', 'massicVolume']
    },
    millilitrePerDay: {
      name: 'millilitrePerDay',
      label: 'millilitre per day',
      symbol: 'ml/d',
      code: 'G54',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerDayBar: {
      name: 'millilitrePerDayBar',
      label: 'millilitre per day bar',
      symbol: 'ml/(d·bar)',
      code: 'G90',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerDayKelvin: {
      name: 'millilitrePerDayKelvin',
      label: 'millilitre per day kelvin',
      symbol: 'ml/(d·K)',
      code: 'G73',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerHour: {
      name: 'millilitrePerHour',
      label: 'millilitre per hour',
      symbol: 'ml/h',
      code: 'G55',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerHourBar: {
      name: 'millilitrePerHourBar',
      label: 'millilitre per hour bar',
      symbol: 'ml/(h·bar)',
      code: 'G91',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerHourKelvin: {
      name: 'millilitrePerHourKelvin',
      label: 'millilitre per hour kelvin',
      symbol: 'ml/(h·K)',
      code: 'G74',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerKelvin: {
      name: 'millilitrePerKelvin',
      label: 'millilitre per kelvin',
      symbol: 'ml/K',
      code: 'G30',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumePerTemperature']
    },
    millilitrePerKilogram: {
      name: 'millilitrePerKilogram',
      label: 'millilitre per kilogram',
      symbol: 'ml/kg',
      code: 'KX',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerKilogram'];
      },
      conversionFactor: '10⁻⁶ m³/kg',
      quantityKinds: ['specificVolume', 'massicVolume', 'specificVolume', 'massicVolume']
    },
    millilitrePerLitre: {
      name: 'millilitrePerLitre',
      label: 'millilitre per litre',
      symbol: 'ml/l',
      code: 'L19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeRatio']
    },
    millilitrePerMinute: {
      name: 'millilitrePerMinute',
      label: 'millilitre per minute',
      symbol: 'ml/min',
      code: '41',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.66667 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    millilitrePerMinuteBar: {
      name: 'millilitrePerMinuteBar',
      label: 'millilitre per minute bar',
      symbol: 'ml/(min·bar)',
      code: 'G92',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerMinuteKelvin: {
      name: 'millilitrePerMinuteKelvin',
      label: 'millilitre per minute kelvin',
      symbol: 'ml/(min·K)',
      code: 'G75',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerSecond: {
      name: 'millilitrePerSecond',
      label: 'millilitre per second',
      symbol: 'ml/s',
      code: '40',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    millilitrePerSecondBar: {
      name: 'millilitrePerSecondBar',
      label: 'millilitre per second bar',
      symbol: 'ml/(s·bar)',
      code: 'G93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerSecondKelvin: {
      name: 'millilitrePerSecondKelvin',
      label: 'millilitre per second kelvin',
      symbol: 'ml/(s·K)',
      code: 'G76',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumeFlowRate']
    },
    millilitrePerSquareCentimetreMinute: {
      name: 'millilitrePerSquareCentimetreMinute',
      label: 'millilitre per square centimetre minute',
      symbol: '(ml/min)/cm²',
      code: 'M22',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecondSquareMetre'];
      },
      conversionFactor: '2.777778 × 10⁻⁶ (m³/s)/m²',
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity', 'porosity']
    },
    millilitrePerSquareCentimetreSecond: {
      name: 'millilitrePerSquareCentimetreSecond',
      label: 'millilitre per square centimetre second',
      symbol: 'ml/(cm²·s)',
      code: '35',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '10⁻² m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'porosity'
      ]
    },
    millimetre: {
      name: 'millimetre',
      label: 'millimetre',
      symbol: 'mm',
      code: 'MMT',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁻³ m',
      quantityKinds: [
        'thickness',
        'lengthOfPath',
        'radius',
        'height',
        'breadth',
        'length',
        'distance',
        'diameter',
        'radiusOfCurvature',
        'cartesianCoordinates',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    millimetrePerBar: {
      name: 'millimetrePerBar',
      label: 'millimetre per bar',
      symbol: 'mm/bar',
      code: 'G06',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'radius',
        'diameter',
        'lengthOfPath',
        'breadth',
        'length',
        'distance',
        'radiusOfCurvature',
        'cartesianCoordinates',
        'height',
        'thickness'
      ]
    },
    millimetrePerDegreeCelsiusMetre: {
      name: 'millimetrePerDegreeCelsiusMetre',
      label: 'millimetre per degree Celsius metre',
      symbol: 'mm/(°C·m)',
      code: 'E97',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalKelvinOrKelvinToThePowerMinusOne'];
      },
      conversionFactor: '10⁻³ K⁻¹',
      quantityKinds: ['thermalDiffusivity', 'relativePressureCoefficient', 'linearExpansionCoefficient', 'cubicExpansionCoefficient']
    },
    millimetrePerHour: {
      name: 'millimetrePerHour',
      label: 'millimetre per hour',
      symbol: 'mm/h',
      code: 'H67',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity']
    },
    millimetrePerKelvin: {
      name: 'millimetrePerKelvin',
      label: 'millimetre per kelvin',
      symbol: 'mm/K',
      code: 'F53',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['thermalDiffusivity']
    },
    millimetrePerMinute: {
      name: 'millimetrePerMinute',
      label: 'millimetre per minute',
      symbol: 'mm/min',
      code: 'H81',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity']
    },
    millimetrePerSecond: {
      name: 'millimetrePerSecond',
      label: 'millimetre per second',
      symbol: 'mm/s',
      code: 'C16',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '10⁻³ m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'groupVelocity',
        'phaseVelocity',
        'velocity'
      ]
    },
    millimetrePerSecondSquared: {
      name: 'millimetrePerSecondSquared',
      label: 'millimetre per second squared',
      symbol: 'mm/s²',
      code: 'M41',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '10⁻³ m/s²',
      quantityKinds: [
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration',
        'acceleration',
        'accelerationDueToGravity',
        'accelerationOfFreeFall'
      ]
    },
    millimetrePerYear: {
      name: 'millimetrePerYear',
      label: 'millimetre per year',
      symbol: 'mm/y',
      code: 'H66',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['velocity', 'phaseVelocity', 'groupVelocity']
    },
    millimetreSquaredPerSecond: {
      name: 'millimetreSquaredPerSecond',
      label: 'millimetre squared per second',
      symbol: 'mm²/s',
      code: 'C17',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerSecond'];
      },
      conversionFactor: '10⁻⁶ m²/s',
      quantityKinds: [
        'kinematicViscosity',
        'diffusionCoefficient',
        'thermalDiffusionCoefficient',
        'kinematicViscosity',
        'diffusionCoefficientForNeutronNumberDensity',
        'thermalDiffusivity'
      ]
    },
    millimetreToTheFourthPower: {
      name: 'millimetreToTheFourthPower',
      label: 'millimetre to the fourth power',
      symbol: 'mm⁴',
      code: 'G77',
      referenceUnit: function () {
        return sammUDefinition.units['metreToTheFourthPower'];
      },
      conversionFactor: '10⁻¹² m⁴',
      quantityKinds: ['secondMomentOfArea', 'secondAxialMomentOfArea', 'secondAxialMomentOfArea', 'secondMomentOfArea']
    },
    millimole: {
      name: 'millimole',
      label: 'millimole',
      symbol: 'mmol',
      code: 'C18',
      referenceUnit: function () {
        return sammUDefinition.units['mole'];
      },
      conversionFactor: '10⁻³ mol',
      quantityKinds: ['amountOfSubstance', 'amountOfSubstance']
    },
    millimolePerGram: {
      name: 'millimolePerGram',
      label: 'millimole per gram',
      symbol: 'mmol/g',
      code: 'H68',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['ionicStrength']
    },
    millimolePerKilogram: {
      name: 'millimolePerKilogram',
      label: 'millimole per kilogram',
      symbol: 'mmol/kg',
      code: 'D87',
      referenceUnit: function () {
        return sammUDefinition.units['molePerKilogram'];
      },
      conversionFactor: '10⁻³ mol/kg',
      quantityKinds: ['molalityOfSoluteB', 'ionicStrength']
    },
    millimolePerLitre: {
      name: 'millimolePerLitre',
      label: 'millimole per litre',
      symbol: 'mmol/l',
      code: 'M33',
      referenceUnit: function () {
        return sammUDefinition.units['molePerCubicMetre'];
      },
      conversionFactor: 'mol/m³',
      quantityKinds: [
        'concentrationOfB',
        'massConcentrationOfB',
        'density',
        'massDensity',
        'volumicMass',
        'amountOfSubstance',
        'concentrationOfB',
        'massConcentrationOfB',
        'volumicMass',
        'amountOfSubstance',
        'density',
        'massDensity'
      ]
    },
    millinewton: {
      name: 'millinewton',
      label: 'millinewton',
      symbol: 'mN',
      code: 'C20',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '10⁻³ N',
      quantityKinds: ['weight', 'force', 'weight', 'force']
    },
    millinewtonMetre: {
      name: 'millinewtonMetre',
      label: 'millinewton metre',
      symbol: 'mN·m',
      code: 'D83',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '10⁻³ N × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple', 'torque', 'momentOfForce', 'momentOfACouple']
    },
    millinewtonPerMetre: {
      name: 'millinewtonPerMetre',
      label: 'millinewton per metre',
      symbol: 'mN/m',
      code: 'C22',
      referenceUnit: function () {
        return sammUDefinition.units['newtonPerMetre'];
      },
      conversionFactor: '10⁻³ N/m',
      quantityKinds: ['surfaceTension', 'surfaceTension']
    },
    milliohm: {
      name: 'milliohm',
      label: 'milliohm',
      symbol: 'mΩ',
      code: 'E45',
      referenceUnit: function () {
        return sammUDefinition.units['ohm'];
      },
      conversionFactor: '10⁻³ Ω',
      quantityKinds: [
        'resistanceToAlternatingCurrent',
        'reactance',
        'complexImpedances',
        'modulusOfImpedance',
        'resistanceToDirectCurrent',
        'impedance',
        'modulusOfImpedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'impedance',
        'resistanceToDirectCurrent'
      ]
    },
    milliohmMetre: {
      name: 'milliohmMetre',
      label: 'milliohm metre',
      symbol: 'mΩ·m',
      code: 'C23',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '10⁻³ Ω × m',
      quantityKinds: ['resistivity', 'residualResistivity', 'resistivity']
    },
    milliohmPerMetre: {
      name: 'milliohmPerMetre',
      label: 'milliohm per metre',
      symbol: 'mΩ/m',
      code: 'F54',
      referenceUnit: function () {
        return sammUDefinition.units['ohmPerMetre'];
      },
      conversionFactor: '10⁻³ Ω/m',
      quantityKinds: ['lineicResistance', 'lineicResistance']
    },
    million: {
      name: 'million',
      label: 'million',
      symbol: null,
      code: 'MIO',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    millionBtuItPerHour: {
      name: 'millionBtuItPerHour',
      label: 'million Btu(IT) per hour',
      symbol: 'BtuIT/h',
      code: 'E16',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '293071.1 W',
      quantityKinds: ['heatFlowRate', 'power', 'activePower', 'radiantEnergyflux', 'powerForDirectCurrent', 'radiantPower', 'soundPower']
    },
    millionBtuPer1000CubicFoot: {
      name: 'millionBtuPer1000CubicFoot',
      label: 'million Btu per 1000 cubic foot',
      symbol: 'MBTU/kft³',
      code: 'M9',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    millionCubicMetre: {
      name: 'millionCubicMetre',
      label: 'million cubic metre',
      symbol: 'Mm³',
      code: 'HMQ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    millionInternationalUnit: {
      name: 'millionInternationalUnit',
      label: 'million international unit',
      symbol: null,
      code: 'MIU',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    millipascal: {
      name: 'millipascal',
      label: 'millipascal',
      symbol: 'mPa',
      code: '74',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁻³ Pa',
      quantityKinds: [
        'modulusOfRigidity',
        'normalStress',
        'shearModulus',
        'bulkModulus',
        'modulusOfElasticity',
        'shearStress',
        'pressure',
        'modulusOfCompression',
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure'
      ]
    },
    millipascalPerMetre: {
      name: 'millipascalPerMetre',
      label: 'millipascal per metre',
      symbol: 'mPa/m',
      code: 'P80',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    millipascalSecond: {
      name: 'millipascalSecond',
      label: 'millipascal second',
      symbol: 'mPa·s',
      code: 'C24',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '10⁻³ Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    millipascalSecondPerBar: {
      name: 'millipascalSecondPerBar',
      label: 'millipascal second per bar',
      symbol: 'mPa·s/bar',
      code: 'L16',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁸ s',
      quantityKinds: [
        'viscosityDynamicViscosity',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    millipascalSecondPerKelvin: {
      name: 'millipascalSecondPerKelvin',
      label: 'millipascal second per kelvin',
      symbol: 'mPa·s/K',
      code: 'L15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['viscosityDynamicViscosity']
    },
    milliradian: {
      name: 'milliradian',
      label: 'milliradian',
      symbol: 'mrad',
      code: 'C25',
      referenceUnit: function () {
        return sammUDefinition.units['rad'];
      },
      conversionFactor: '10⁻³ rad',
      quantityKinds: ['anglePlane', 'absorbedDose']
    },
    milliroentgen: {
      name: 'milliroentgen',
      label: 'milliroentgen',
      symbol: 'mR',
      code: '2Y',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerKilogram'];
      },
      conversionFactor: '2.58 × 10⁻⁷ C/kg',
      quantityKinds: ['exposure', 'exposure']
    },
    milliroentgenAequivalentMen: {
      name: 'milliroentgenAequivalentMen',
      label: 'milliroentgen aequivalent men',
      symbol: 'mrem',
      code: 'L31',
      referenceUnit: function () {
        return sammUDefinition.units['sievert'];
      },
      conversionFactor: '10⁻⁵ Sv',
      quantityKinds: ['doseEquivalent', 'doseEquivalent']
    },
    millisecond: {
      name: 'millisecond',
      label: 'millisecond',
      symbol: 'ms',
      code: 'C26',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻³ s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    millisiemens: {
      name: 'millisiemens',
      label: 'millisiemens',
      symbol: 'mS',
      code: 'C27',
      referenceUnit: function () {
        return sammUDefinition.units['siemens'];
      },
      conversionFactor: '10⁻³ S',
      quantityKinds: [
        'admittance',
        'modulusOfAdmittance',
        'conductanceForAlternatingCurrent',
        'conductanceForDirectCurrent',
        'complexAdmittance',
        'admittance',
        'modulusOfAdmittance',
        'complexAdmittance',
        'conductanceForDirectCurrent',
        'conductanceForAlternatingCurrent'
      ]
    },
    millisiemensPerCentimetre: {
      name: 'millisiemensPerCentimetre',
      label: 'millisiemens per centimetre',
      symbol: 'mS/cm',
      code: 'H61',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10⁻¹ S/m',
      quantityKinds: ['electrolyticConductivity', 'conductivity', 'conductivity']
    },
    millisievert: {
      name: 'millisievert',
      label: 'millisievert',
      symbol: 'mSv',
      code: 'C28',
      referenceUnit: function () {
        return sammUDefinition.units['sievert'];
      },
      conversionFactor: '10⁻³ Sv',
      quantityKinds: ['doseEquivalent', 'doseEquivalent']
    },
    millisievertPerHour: {
      name: 'millisievertPerHour',
      label: 'millisievert per hour',
      symbol: 'mSv/h',
      code: 'P71',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '0.277777778 × 10⁻⁷ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    millisievertPerMinute: {
      name: 'millisievertPerMinute',
      label: 'millisievert per minute',
      symbol: 'mSv/min',
      code: 'P75',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '1.666666667 × 10⁻⁵ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    millisievertPerSecond: {
      name: 'millisievertPerSecond',
      label: 'millisievert per second',
      symbol: 'mSv/s',
      code: 'P66',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '10⁻³ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    millitesla: {
      name: 'millitesla',
      label: 'millitesla',
      symbol: 'mT',
      code: 'C29',
      referenceUnit: function () {
        return sammUDefinition.units['tesla'];
      },
      conversionFactor: '10⁻³ T',
      quantityKinds: [
        'magneticPolarization',
        'lowerCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticInduction',
        'thermodynamicCriticalMagneticFluxDensity',
        'upperCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticPolarization',
        'magneticInduction'
      ]
    },
    millivolt: {
      name: 'millivolt',
      label: 'millivolt',
      symbol: 'mV',
      code: '2Z',
      referenceUnit: function () {
        return sammUDefinition.units['volt'];
      },
      conversionFactor: '10⁻³ V',
      quantityKinds: [
        'thermoelectromotiveForceBetweenSubstancesAAndB',
        'electricPotential',
        'peltierCoefficientForSubstancesAAndB',
        'electromotiveForce',
        'potentialDifference',
        'tension',
        'voltage',
        'electricPotential',
        'potentialDifference',
        'electromotiveForce',
        'voltage',
        'tension'
      ]
    },
    millivoltAmpere: {
      name: 'millivoltAmpere',
      label: 'millivolt - ampere',
      symbol: 'mV·A',
      code: 'M35',
      referenceUnit: function () {
        return sammUDefinition.units['voltAmpere'];
      },
      conversionFactor: '10⁻³ V × A',
      quantityKinds: ['apparentPower', 'apparentPower']
    },
    millivoltPerKelvin: {
      name: 'millivoltPerKelvin',
      label: 'millivolt per kelvin',
      symbol: 'mV/K',
      code: 'D49',
      referenceUnit: function () {
        return sammUDefinition.units['voltPerKelvin'];
      },
      conversionFactor: '10⁻³ V/K',
      quantityKinds: ['seebeckCoefficientForSubstancesAAndB', 'thompsonCoefficient']
    },
    millivoltPerMetre: {
      name: 'millivoltPerMetre',
      label: 'millivolt per metre',
      symbol: 'mV/m',
      code: 'C30',
      referenceUnit: function () {
        return sammUDefinition.units['voltPerMetre'];
      },
      conversionFactor: '10⁻³ V/m',
      quantityKinds: ['electricFieldStrength', 'electricFieldStrength']
    },
    millivoltPerMinute: {
      name: 'millivoltPerMinute',
      label: 'millivolt per minute',
      symbol: 'mV/min',
      code: 'H62',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    milliwatt: {
      name: 'milliwatt',
      label: 'milliwatt',
      symbol: 'mW',
      code: 'C31',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10⁻³ W',
      quantityKinds: [
        'power',
        'activePower',
        'powerForDirectCurrent',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    milliwattPerSquareMetre: {
      name: 'milliwattPerSquareMetre',
      label: 'milliwatt per square metre',
      symbol: 'mW/m²',
      code: 'C32',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '10⁻³ W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'soundIntensity'
      ]
    },
    milliweber: {
      name: 'milliweber',
      label: 'milliweber',
      symbol: 'mWb',
      code: 'C33',
      referenceUnit: function () {
        return sammUDefinition.units['weber'];
      },
      conversionFactor: '10⁻³ Wb',
      quantityKinds: ['magneticFluxQuantum', 'magneticFlux', 'magneticFlux']
    },
    minuteUnitOfAngle: {
      name: 'minuteUnitOfAngle',
      label: 'minute [unit of angle]',
      symbol: "'",
      code: 'D61',
      referenceUnit: function () {
        return sammUDefinition.units['rad'];
      },
      conversionFactor: '2.908882 × 10⁻⁴ rad',
      quantityKinds: ['absorbedDose', 'anglePlane']
    },
    minuteUnitOfTime: {
      name: 'minuteUnitOfTime',
      label: 'minute [unit of time]',
      symbol: 'min',
      code: 'MIN',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '60 s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'time'
      ]
    },
    mmscfPerDay: {
      name: 'mmscfPerDay',
      label: 'MMSCF/day',
      symbol: null,
      code: '5E',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    moduleWidth: {
      name: 'moduleWidth',
      label: 'module width',
      symbol: 'MW',
      code: 'H77',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    molPerCubicMetrePascal: {
      name: 'molPerCubicMetrePascal',
      label: 'mol per cubic metre pascal',
      symbol: '(mol/m³)/Pa',
      code: 'P52',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['density', 'massDensity', 'massConcentrationOfB', 'concentrationOfB', 'volumicMass', 'amountOfSubstance']
    },
    molPerKilogramPascal: {
      name: 'molPerKilogramPascal',
      label: 'mol per kilogram pascal',
      symbol: '(mol/kg)/Pa',
      code: 'P51',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['concentrationOfB', 'density', 'volumicMass', 'massDensity', 'amountOfSubstance', 'massConcentrationOfB']
    },
    mole: {
      name: 'mole',
      label: 'mole',
      symbol: 'mol',
      code: 'C34',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['amountOfSubstance']
    },
    molePerCubicDecimetre: {
      name: 'molePerCubicDecimetre',
      label: 'mole per cubic decimetre',
      symbol: 'mol/dm³',
      code: 'C35',
      referenceUnit: function () {
        return sammUDefinition.units['molePerCubicMetre'];
      },
      conversionFactor: '10³ mol/m³',
      quantityKinds: [
        'amountOfSubstance',
        'concentrationOfB',
        'massConcentrationOfB',
        'volumicMass',
        'density',
        'massDensity',
        'concentrationOfB',
        'massConcentrationOfB',
        'density',
        'massDensity',
        'volumicMass',
        'amountOfSubstance'
      ]
    },
    molePerCubicMetre: {
      name: 'molePerCubicMetre',
      label: 'mole per cubic metre',
      symbol: 'mol/m³',
      code: 'C36',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['concentrationOfB', 'massConcentrationOfB', 'density', 'massDensity', 'volumicMass', 'amountOfSubstance']
    },
    molePerCubicMetreBar: {
      name: 'molePerCubicMetreBar',
      label: 'mole per cubic metre bar',
      symbol: '(mol/m³)/bar',
      code: 'L29',
      referenceUnit: function () {
        return sammUDefinition.units['molPerCubicMetrePascal'];
      },
      conversionFactor: '10⁻⁵ (mol/m³)/Pa',
      quantityKinds: [
        'density',
        'massDensity',
        'massConcentrationOfB',
        'concentrationOfB',
        'volumicMass',
        'amountOfSubstance',
        'massConcentrationOfB',
        'volumicMass',
        'amountOfSubstance',
        'density',
        'concentrationOfB',
        'massDensity'
      ]
    },
    molePerCubicMetreKelvin: {
      name: 'molePerCubicMetreKelvin',
      label: 'mole per cubic metre kelvin',
      symbol: '(mol/m³)/K',
      code: 'L28',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massConcentrationOfB', 'amountOfSubstance', 'density', 'volumicMass', 'massDensity', 'concentrationOfB']
    },
    molePerCubicMetreToThePowerSumOfStoichiometricNumbers: {
      name: 'molePerCubicMetreToThePowerSumOfStoichiometricNumbers',
      label: 'mole per cubic metre to the power sum of stoichiometric numbers',
      symbol: '(mol/m³)∑νB',
      code: 'P99',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    molePerHour: {
      name: 'molePerHour',
      label: 'mole per hour',
      symbol: 'mol/h',
      code: 'L23',
      referenceUnit: function () {
        return sammUDefinition.units['molePerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ mol/s',
      quantityKinds: ['molarFlux', 'volumicMass', 'amountOfSubstance', 'massConcentrationOfB', 'density', 'concentrationOfB', 'massDensity']
    },
    molePerKilogram: {
      name: 'molePerKilogram',
      label: 'mole per kilogram',
      symbol: 'mol/kg',
      code: 'C19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['molalityOfSoluteB']
    },
    molePerKilogramBar: {
      name: 'molePerKilogramBar',
      label: 'mole per kilogram bar',
      symbol: '(mol/kg)/bar',
      code: 'L25',
      referenceUnit: function () {
        return sammUDefinition.units['molPerKilogramPascal'];
      },
      conversionFactor: '10⁻⁵ (mol/kg)/Pa',
      quantityKinds: [
        'massConcentrationOfB',
        'volumicMass',
        'massDensity',
        'amountOfSubstance',
        'density',
        'concentrationOfB',
        'concentrationOfB',
        'density',
        'volumicMass',
        'massDensity',
        'amountOfSubstance',
        'massConcentrationOfB'
      ]
    },
    molePerKilogramKelvin: {
      name: 'molePerKilogramKelvin',
      label: 'mole per kilogram kelvin',
      symbol: '(mol/kg)/K',
      code: 'L24',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['density', 'massDensity', 'massConcentrationOfB', 'concentrationOfB', 'volumicMass', 'amountOfSubstance']
    },
    molePerLitre: {
      name: 'molePerLitre',
      label: 'mole per litre',
      symbol: 'mol/l',
      code: 'C38',
      referenceUnit: function () {
        return sammUDefinition.units['molePerCubicMetre'];
      },
      conversionFactor: '10³ mol/m³',
      quantityKinds: [
        'concentrationOfB',
        'massConcentrationOfB',
        'density',
        'massDensity',
        'volumicMass',
        'amountOfSubstance',
        'amountOfSubstance',
        'density',
        'volumicMass',
        'massDensity',
        'massConcentrationOfB',
        'concentrationOfB'
      ]
    },
    molePerLitreBar: {
      name: 'molePerLitreBar',
      label: 'mole per litre bar',
      symbol: '(mol/l)/bar',
      code: 'L27',
      referenceUnit: function () {
        return sammUDefinition.units['molPerCubicMetrePascal'];
      },
      conversionFactor: '10⁻² (mol/m³)/Pa',
      quantityKinds: [
        'massConcentrationOfB',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'volumicMass',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'concentrationOfB',
        'volumicMass',
        'amountOfSubstance'
      ]
    },
    molePerLitreKelvin: {
      name: 'molePerLitreKelvin',
      label: 'mole per litre kelvin',
      symbol: '(mol/l)/K',
      code: 'L26',
      referenceUnit: function () {
        return sammUDefinition.units['molePerCubicMetreKelvin'];
      },
      conversionFactor: '10³ (mol/m³)/K',
      quantityKinds: [
        'massConcentrationOfB',
        'amountOfSubstance',
        'density',
        'volumicMass',
        'massDensity',
        'concentrationOfB',
        'massDensity',
        'amountOfSubstance',
        'massConcentrationOfB',
        'concentrationOfB',
        'volumicMass',
        'density'
      ]
    },
    molePerMinute: {
      name: 'molePerMinute',
      label: 'mole per minute',
      symbol: 'mol/min',
      code: 'L30',
      referenceUnit: function () {
        return sammUDefinition.units['molePerSecond'];
      },
      conversionFactor: '1.66667 × 10⁻² mol/s',
      quantityKinds: ['volumicMass', 'amountOfSubstance', 'massConcentrationOfB', 'density', 'concentrationOfB', 'massDensity', 'molarFlux']
    },
    molePerSecond: {
      name: 'molePerSecond',
      label: 'mole per second',
      symbol: 'mol/s',
      code: 'E95',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'amountOfSubstance', 'massConcentrationOfB', 'density', 'concentrationOfB', 'massDensity']
    },
    monetaryValue: {
      name: 'monetaryValue',
      label: 'monetary value',
      symbol: null,
      code: 'M4',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    month: {
      name: 'month',
      label: 'month',
      symbol: 'mo',
      code: 'MON',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '2.629800 × 10⁶ s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    mutuallyDefined: {
      name: 'mutuallyDefined',
      label: 'mutually defined',
      symbol: null,
      code: 'ZZ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    nanoampere: {
      name: 'nanoampere',
      label: 'nanoampere',
      symbol: 'nA',
      code: 'C39',
      referenceUnit: function () {
        return sammUDefinition.units['ampere'];
      },
      conversionFactor: '10⁻⁹ A',
      quantityKinds: [
        'electricCurrent',
        'magnetomotiveForce',
        'magneticPotentialDifference',
        'currentLinkage',
        'magneticPotentialDifference',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent'
      ]
    },
    nanocoulomb: {
      name: 'nanocoulomb',
      label: 'nanocoulomb',
      symbol: 'nC',
      code: 'C40',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '10⁻⁹ C',
      quantityKinds: [
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'electricCharge',
        'electricFluxFluxOfDisplacement',
        'quantityOfElectricity'
      ]
    },
    nanofarad: {
      name: 'nanofarad',
      label: 'nanofarad',
      symbol: 'nF',
      code: 'C41',
      referenceUnit: function () {
        return sammUDefinition.units['farad'];
      },
      conversionFactor: '10⁻⁹ F',
      quantityKinds: ['capacitance', 'capacitance']
    },
    nanofaradPerMetre: {
      name: 'nanofaradPerMetre',
      label: 'nanofarad per metre',
      symbol: 'nF/m',
      code: 'C42',
      referenceUnit: function () {
        return sammUDefinition.units['faradPerMetre'];
      },
      conversionFactor: '10⁻⁹ F/m',
      quantityKinds: [
        'permittivityOfVacuum',
        'permittivity',
        'electricConstant',
        'electricConstant',
        'permittivity',
        'permittivityOfVacuum'
      ]
    },
    nanogramPerKilogram: {
      name: 'nanogramPerKilogram',
      label: 'nanogram per kilogram',
      symbol: 'ng/kg',
      code: 'L32',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massRatio']
    },
    nanograyPerHour: {
      name: 'nanograyPerHour',
      label: 'nanogray per hour',
      symbol: 'nGy/h',
      code: 'P64',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻¹³ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    nanograyPerMinute: {
      name: 'nanograyPerMinute',
      label: 'nanogray per minute',
      symbol: 'nGy/min',
      code: 'P60',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '1.66667 × 10⁻¹¹ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    nanograyPerSecond: {
      name: 'nanograyPerSecond',
      label: 'nanogray per second',
      symbol: 'nGy/s',
      code: 'P56',
      referenceUnit: function () {
        return sammUDefinition.units['grayPerSecond'];
      },
      conversionFactor: '10⁻⁹ Gy/s',
      quantityKinds: ['absorbedDoseRate', 'absorbedDoseRate']
    },
    nanohenry: {
      name: 'nanohenry',
      label: 'nanohenry',
      symbol: 'nH',
      code: 'C43',
      referenceUnit: function () {
        return sammUDefinition.units['henry'];
      },
      conversionFactor: '10⁻⁹ H',
      quantityKinds: ['selfInductance', 'mutualInductance', 'permeance', 'selfInductance', 'permeance', 'mutualInductance']
    },
    nanohenryPerMetre: {
      name: 'nanohenryPerMetre',
      label: 'nanohenry per metre',
      symbol: 'nH/m',
      code: 'C44',
      referenceUnit: function () {
        return sammUDefinition.units['henryPerMetre'];
      },
      conversionFactor: '10⁻⁹ H/m',
      quantityKinds: [
        'permeabilityOfVacuum',
        'permeability',
        'magneticConstant',
        'permeabilityOfVacuum',
        'permeability',
        'magneticConstant'
      ]
    },
    nanometre: {
      name: 'nanometre',
      label: 'nanometre',
      symbol: 'nm',
      code: 'C45',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁻⁹ m',
      quantityKinds: [
        'thickness',
        'length',
        'distance',
        'radiusOfCurvature',
        'radius',
        'lengthOfPath',
        'height',
        'cartesianCoordinates',
        'breadth',
        'diameter',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    nanoohm: {
      name: 'nanoohm',
      label: 'nanoohm',
      symbol: 'nΩ',
      code: 'P22',
      referenceUnit: function () {
        return sammUDefinition.units['ohm'];
      },
      conversionFactor: '10⁻⁹ Ω',
      quantityKinds: [
        'modulusOfImpedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'impedance',
        'resistanceToDirectCurrent',
        'impedance',
        'resistanceToAlternatingCurrent',
        'modulusOfImpedance',
        'complexImpedances',
        'reactance',
        'resistanceToDirectCurrent'
      ]
    },
    nanoohmMetre: {
      name: 'nanoohmMetre',
      label: 'nanoohm metre',
      symbol: 'nΩ·m',
      code: 'C46',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['resistivity']
    },
    nanosecond: {
      name: 'nanosecond',
      label: 'nanosecond',
      symbol: 'ns',
      code: 'C47',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁹ s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    nanosiemensPerCentimetre: {
      name: 'nanosiemensPerCentimetre',
      label: 'nanosiemens per centimetre',
      symbol: 'nS/cm',
      code: 'G44',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10⁻⁷ S/m',
      quantityKinds: ['conductivity', 'electrolyticConductivity', 'conductivity']
    },
    nanosiemensPerMetre: {
      name: 'nanosiemensPerMetre',
      label: 'nanosiemens per metre',
      symbol: 'nS/m',
      code: 'G45',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10⁻⁹ S/m',
      quantityKinds: ['electrolyticConductivity', 'conductivity', 'conductivity']
    },
    nanosievertPerHour: {
      name: 'nanosievertPerHour',
      label: 'nanosievert per hour',
      symbol: 'nSv/h',
      code: 'P73',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '0.277777778 × 10⁻¹³ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    nanosievertPerMinute: {
      name: 'nanosievertPerMinute',
      label: 'nanosievert per minute',
      symbol: 'nSv/min',
      code: 'P77',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '1.666666667 × 10⁻¹¹ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    nanosievertPerSecond: {
      name: 'nanosievertPerSecond',
      label: 'nanosievert per second',
      symbol: 'nSv/s',
      code: 'P68',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '10⁻⁹ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    nanotesla: {
      name: 'nanotesla',
      label: 'nanotesla',
      symbol: 'nT',
      code: 'C48',
      referenceUnit: function () {
        return sammUDefinition.units['tesla'];
      },
      conversionFactor: '10⁻⁹ T',
      quantityKinds: [
        'magneticPolarization',
        'lowerCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticInduction',
        'thermodynamicCriticalMagneticFluxDensity',
        'upperCriticalMagneticFluxDensity',
        'magneticPolarization',
        'magneticInduction',
        'magneticFluxDensity'
      ]
    },
    nanowatt: {
      name: 'nanowatt',
      label: 'nanowatt',
      symbol: 'nW',
      code: 'C49',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10⁻⁹ W',
      quantityKinds: [
        'activePower',
        'powerForDirectCurrent',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    naturalUnitOfInformation: {
      name: 'naturalUnitOfInformation',
      label: 'natural unit of information',
      symbol: 'nat',
      code: 'Q16',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    naturalUnitOfInformationPerSecond: {
      name: 'naturalUnitOfInformationPerSecond',
      label: 'natural unit of information per second',
      symbol: 'nat/s',
      code: 'Q19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    nauticalMile: {
      name: 'nauticalMile',
      label: 'nautical mile',
      symbol: 'n mile',
      code: 'NMI',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '1852 m',
      quantityKinds: [
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity',
        'radius',
        'breadth',
        'diameter',
        'thickness',
        'lengthOfPath',
        'cartesianCoordinates',
        'distance',
        'length',
        'radiusOfCurvature',
        'height'
      ]
    },
    neper: {
      name: 'neper',
      label: 'neper',
      symbol: 'Np',
      code: 'C50',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['logarithmicDecrement', 'levelOfAPowerQuantity', 'levelOfAFieldQuantity']
    },
    neperPerSecond: {
      name: 'neperPerSecond',
      label: 'neper per second',
      symbol: 'Np/s',
      code: 'C51',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['dampingCoefficient']
    },
    netKilogram: {
      name: 'netKilogram',
      label: 'net kilogram',
      symbol: null,
      code: '58',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    netTon: {
      name: 'netTon',
      label: 'net ton',
      symbol: null,
      code: 'NT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    newton: {
      name: 'newton',
      label: 'newton',
      symbol: 'N',
      code: 'NEW',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['weight', 'force']
    },
    newtonCentimetre: {
      name: 'newtonCentimetre',
      label: 'newton centimetre',
      symbol: 'N·cm',
      code: 'F88',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonMetre: {
      name: 'newtonMetre',
      label: 'newton metre',
      symbol: 'N·m',
      code: 'NU',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonMetrePerAmpere: {
      name: 'newtonMetrePerAmpere',
      label: 'newton metre per ampere',
      symbol: 'N·m/A',
      code: 'F90',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonMetrePerDegree: {
      name: 'newtonMetrePerDegree',
      label: 'newton metre per degree',
      symbol: 'Nm/°',
      code: 'F89',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonMetrePerKilogram: {
      name: 'newtonMetrePerKilogram',
      label: 'newton metre per kilogram',
      symbol: 'N·m/kg',
      code: 'G19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonMetrePerMetre: {
      name: 'newtonMetrePerMetre',
      label: 'newton metre per metre',
      symbol: 'N·m/m²',
      code: 'Q27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    newtonMetrePerRadian: {
      name: 'newtonMetrePerRadian',
      label: 'newton metre per radian',
      symbol: 'N·m/rad',
      code: 'M93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonMetrePerSquareMetre: {
      name: 'newtonMetrePerSquareMetre',
      label: 'newton metre per square metre',
      symbol: 'N·m/m²',
      code: 'M34',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torsionalStiffness', 'areaRelatedTorsionalMoment']
    },
    newtonMetreSecond: {
      name: 'newtonMetreSecond',
      label: 'newton metre second',
      symbol: 'N·m·s',
      code: 'C53',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['angularImpulse']
    },
    newtonMetreSquaredPerKilogramSquared: {
      name: 'newtonMetreSquaredPerKilogramSquared',
      label: 'newton metre squared per kilogram squared',
      symbol: 'N·m²/kg²',
      code: 'C54',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['gravitationalConstant']
    },
    newtonMetreWattToThePowerMinus0point5: {
      name: 'newtonMetreWattToThePowerMinus0point5',
      label: 'newton metre watt to the power minus 0,5',
      symbol: 'N·m·W⁻⁰‧⁵',
      code: 'H41',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonPerAmpere: {
      name: 'newtonPerAmpere',
      label: 'newton per ampere',
      symbol: 'N/A',
      code: 'H40',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonPerCentimetre: {
      name: 'newtonPerCentimetre',
      label: 'newton per centimetre',
      symbol: 'N/cm',
      code: 'M23',
      referenceUnit: function () {
        return sammUDefinition.units['newtonPerMetre'];
      },
      conversionFactor: '10² N/m',
      quantityKinds: ['surfaceTension', 'surfaceTension']
    },
    newtonPerMetre: {
      name: 'newtonPerMetre',
      label: 'newton per metre',
      symbol: 'N/m',
      code: '4P',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['surfaceTension']
    },
    newtonPerMillimetre: {
      name: 'newtonPerMillimetre',
      label: 'newton per millimetre',
      symbol: 'N/mm',
      code: 'F47',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    newtonPerSquareCentimetre: {
      name: 'newtonPerSquareCentimetre',
      label: 'newton per square centimetre',
      symbol: 'N/cm²',
      code: 'E01',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁴ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'pressure',
        'modulusOfRigidity',
        'bulkModulus',
        'modulusOfElasticity',
        'shearStress',
        'shearModulus',
        'normalStress',
        'modulusOfCompression'
      ]
    },
    newtonPerSquareMetre: {
      name: 'newtonPerSquareMetre',
      label: 'newton per square metre',
      symbol: 'N/m²',
      code: 'C55',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: 'Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfRigidity',
        'modulusOfElasticity',
        'pressure',
        'normalStress',
        'shearStress',
        'bulkModulus',
        'shearModulus',
        'modulusOfCompression'
      ]
    },
    newtonPerSquareMillimetre: {
      name: 'newtonPerSquareMillimetre',
      label: 'newton per square millimetre',
      symbol: 'N/mm²',
      code: 'C56',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '10⁶ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfRigidity',
        'modulusOfCompression',
        'shearStress',
        'bulkModulus',
        'normalStress',
        'shearModulus',
        'modulusOfElasticity',
        'pressure'
      ]
    },
    newtonSecond: {
      name: 'newtonSecond',
      label: 'newton second',
      symbol: 'N·s',
      code: 'C57',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['impulse']
    },
    newtonSecondPerMetre: {
      name: 'newtonSecondPerMetre',
      label: 'newton second per metre',
      symbol: 'N·s/m',
      code: 'C58',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['mechanicalImpedance']
    },
    newtonSecondPerSquareMetre: {
      name: 'newtonSecondPerSquareMetre',
      label: 'newton second per square metre',
      symbol: '(N/m²)·s',
      code: 'N36',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: 'Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    newtonSquareMetrePerAmpere: {
      name: 'newtonSquareMetrePerAmpere',
      label: 'newton square metre per ampere',
      symbol: 'N·m²/A',
      code: 'P49',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticDipoleMoment']
    },
    nil: {
      name: 'nil',
      label: 'nil',
      symbol: '()',
      code: 'NIL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    numberOfArticles: {
      name: 'numberOfArticles',
      label: 'number of articles',
      symbol: null,
      code: 'NAR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    numberOfCells: {
      name: 'numberOfCells',
      label: 'number of cells',
      symbol: null,
      code: 'NCL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    numberOfInternationalUnits: {
      name: 'numberOfInternationalUnits',
      label: 'number of international units',
      symbol: null,
      code: 'NIU',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    numberOfJewels: {
      name: 'numberOfJewels',
      label: 'number of jewels',
      symbol: null,
      code: 'JWL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    numberOfPacks: {
      name: 'numberOfPacks',
      label: 'number of packs',
      symbol: null,
      code: 'NMP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    numberOfParts: {
      name: 'numberOfParts',
      label: 'number of parts',
      symbol: null,
      code: 'NPT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    numberOfWords: {
      name: 'numberOfWords',
      label: 'number of words',
      symbol: null,
      code: 'D68',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    octave: {
      name: 'octave',
      label: 'octave',
      symbol: null,
      code: 'C59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['frequencyInterval']
    },
    octet: {
      name: 'octet',
      label: 'octet',
      symbol: 'o',
      code: 'Q12',
      referenceUnit: function () {
        return sammUDefinition.units['bit'];
      },
      conversionFactor: '8 bit',
      quantityKinds: ['informationEntropy']
    },
    octetPerSecond: {
      name: 'octetPerSecond',
      label: 'octet per second',
      symbol: 'o/s',
      code: 'Q13',
      referenceUnit: function () {
        return sammUDefinition.units['bitPerSecond'];
      },
      conversionFactor: '8 bit/s',
      quantityKinds: null
    },
    ohm: {
      name: 'ohm',
      label: 'ohm',
      symbol: 'Ω',
      code: 'OHM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'modulusOfImpedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'impedance',
        'resistanceToDirectCurrent'
      ]
    },
    ohmCentimetre: {
      name: 'ohmCentimetre',
      label: 'ohm centimetre',
      symbol: 'Ω·cm',
      code: 'C60',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '10⁻² Ω × m',
      quantityKinds: ['resistivity', 'resistivity', 'residualResistivity']
    },
    ohmCircularMilPerFoot: {
      name: 'ohmCircularMilPerFoot',
      label: 'ohm circular-mil per foot',
      symbol: 'Ω·cmil/ft',
      code: 'P23',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '1.662426 × 10⁻⁹ Ω × m',
      quantityKinds: ['resistivity', 'residualResistivity', 'resistivity']
    },
    ohmKilometre: {
      name: 'ohmKilometre',
      label: 'ohm kilometre',
      symbol: 'Ω·km',
      code: 'M24',
      referenceUnit: function () {
        return sammUDefinition.units['ohmMetre'];
      },
      conversionFactor: '10³ Ω × m',
      quantityKinds: ['resistivity', 'resistivity', 'residualResistivity']
    },
    ohmMetre: {
      name: 'ohmMetre',
      label: 'ohm metre',
      symbol: 'Ω·m',
      code: 'C61',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['resistivity', 'residualResistivity']
    },
    ohmPerKilometre: {
      name: 'ohmPerKilometre',
      label: 'ohm per kilometre',
      symbol: 'Ω/km',
      code: 'F56',
      referenceUnit: function () {
        return sammUDefinition.units['ohmPerMetre'];
      },
      conversionFactor: '10⁻³ Ω/m',
      quantityKinds: ['lineicResistance', 'lineicResistance']
    },
    ohmPerMetre: {
      name: 'ohmPerMetre',
      label: 'ohm per metre',
      symbol: 'Ω/m',
      code: 'H26',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['lineicResistance']
    },
    ohmPerMileStatuteMile: {
      name: 'ohmPerMileStatuteMile',
      label: 'ohm per mile (statute mile)',
      symbol: 'Ω/mi',
      code: 'F55',
      referenceUnit: function () {
        return sammUDefinition.units['ohmPerMetre'];
      },
      conversionFactor: '6.21371 × 10⁻⁴  Ω/m',
      quantityKinds: ['lineicResistance', 'lineicResistance']
    },
    one: {
      name: 'one',
      label: 'one',
      symbol: '1',
      code: 'C62',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'leakageCoefficient',
        'fineStructureConstant',
        'pecletNumber',
        'stantonNumber',
        'froudeNumber',
        'nusseltNumber',
        'lethargy',
        'transmissionFactor',
        'nuclearSpinQuantumNumber',
        'relativeElongation',
        'cowlingNumber',
        'internalConversionFactor',
        'dissipance',
        'refractiveIndex',
        'strouhalNumber',
        'shortRangeOrderParameter',
        'nusseltNumberForMassTransfer',
        'machNumber',
        'grandPartitionFunction',
        'magneticQuantumNumber',
        'transmittance',
        'activityCoefficientOfSoluteBEspeciallyInADiluteSolution',
        'thermalUtilizationFactor',
        'knudsenNumber',
        'magneticSusceptibility',
        'standardAbsoluteActivityOfSolventAEspeciallyInADiluteSolution',
        'reactivity',
        'restMassOfProton',
        'linearStrain',
        'electricSusceptibility',
        'relativePermeability',
        'hartmannNumber',
        'grueneisenParameter',
        'infiniteMediumMultiplicationFactor',
        'standardAbsoluteActivityOfBInAGaseousMixture',
        'reflectionFactor',
        'orderOfReflexion',
        'standardEquilibriumConstant',
        'emissivityAtASpecifiedWavelength',
        'gFactorOfAtomOrElectron',
        'totalAngularMomentumQuantumNumber',
        'spinAngularMomentumQuantumNumber',
        'relativeDensity',
        'numberOfTurnsInAWinding',
        'landauGinzburgNumber',
        'spectralReflectance',
        'spectralAbsorptance',
        'madelungConstant',
        'emissivity',
        'principleQuantumNumber',
        'hyperfineStructureQuantumNumber',
        'restMassOfElectron',
        'schmidtNumber',
        'luminousEfficiencyAtASpecifiedWavelength',
        'microcanonicalPartitionFunction',
        'coordinatesTrichromatic',
        'relativeActivityOfSolventAEspeciallyInADiluteSolution',
        'poissonRatio',
        'chargeNumberOfIon',
        'massNumber',
        'thermalDiffusionFactor',
        'relativeMassDefect',
        'weberNumber',
        'spectralAbsorptionFactor',
        'moleFractionOfB',
        'spectralTransmissionFactor',
        'coefficientOfFriction',
        'alfvenNumber',
        'prandtlNumber',
        'spectralReflectionfactor',
        'relativeMolecularMass',
        'neutronNumber',
        'opticalDensity',
        'cieColorimetricFunctions',
        'fastFissionFactor',
        'debyeWalleFactor',
        'poissonNumber',
        'restMassOfNeutron',
        'numberOfPairsOfPoles',
        'isentropicExponent',
        'atomicNumber',
        'gFactorOfNucleus',
        'relativeMassDensity',
        'rayleighNumber',
        'grashofNumberForMassTransfer',
        'shearStrain',
        'activityCoefficientOfBInALiquidAsASolidMixture',
        'luminousEfficiency',
        'spectralEmissivity',
        'currentFractionOfIonB',
        'dissipationFactor',
        'canonicalPartitionFunction',
        'relativeMassExcess',
        'moleRatioOfSoluteB',
        'relativeAtomicMass',
        'ratioOfTheMassicHeatCapacity',
        'fourierNumberForMassTransfer',
        'partitionFunctionOfAMolecule',
        'nucleonNumber',
        'absorbance',
        'lewisNumber',
        'transportNumberOfIonB',
        'molecularPartitionFunction',
        'spectralRadianceFactor',
        'relativePermittivity',
        'standardAbsoluteActivityOfSoluteBEspeciallyInADiluteSolution',
        'pecletNumberForMassTransfer',
        'magneticReynoldsNumber',
        'multiplicationFactor',
        'reflectance',
        'thermalDiffusionRatio',
        'statisticalWeight',
        'protonNumber',
        'numberOfMoleculesOrOtherElementaryEntities',
        'activityOfSolventA',
        'standardAbsoluteActivityOfBInALiquidOrASolidMixture',
        'numberOfPhases',
        'absorptionFactor',
        'degreeOfDissociation',
        'resonanceEscapeProbability',
        'eulerNumber',
        'frictionFactor',
        'couplingCoefficient',
        'bindingFraction',
        'nonLeakageProbability',
        'stoichiometricNumberOfB',
        'volumeOrBulkStrain',
        'neutronYieldPerAbsorption',
        'ratioOfTheSpecificHeatCapacities',
        'neutronYieldPerFission',
        'stantonNumberForMassTransfer',
        'effectiveMultiplicationFactor',
        'fourierNumber',
        'reynoldsNumber',
        'grandCanonicalPartitionFunction',
        'spectralLuminousEfficiency',
        'spectralTransmittance',
        'osmoticCoefficientOfTheSolventAEspeciallyInADiluteSolution',
        'orbitalAngularMomentumQuantumNumber',
        'longRangeOrderParameter',
        'grashofNumber',
        'directionalSpectralEmissivity',
        'packingFraction',
        'absoluteActivity',
        'mobilityRatio',
        'averageLogarithmicEnergyDecrement'
      ]
    },
    onePerOne: {
      name: 'onePerOne',
      label: 'one per one',
      symbol: '1/1',
      code: 'Q26',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    ounceAvoirdupois: {
      name: 'ounceAvoirdupois',
      label: 'ounce (avoirdupois)',
      symbol: 'oz',
      code: 'ONZ',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '2.834952 × 10⁻² kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    ounceAvoirdupoisForce: {
      name: 'ounceAvoirdupoisForce',
      label: 'ounce (avoirdupois)-force',
      symbol: 'ozf',
      code: 'L40',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '0.2780139 N',
      quantityKinds: ['weight', 'force', 'weight', 'force']
    },
    ounceAvoirdupoisForceInch: {
      name: 'ounceAvoirdupoisForceInch',
      label: 'ounce (avoirdupois)-force inch',
      symbol: 'ozf·in',
      code: 'L41',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '7.061552 × 10⁻³ N × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple', 'torque', 'momentOfForce', 'momentOfACouple']
    },
    ounceAvoirdupoisPerCubicInch: {
      name: 'ounceAvoirdupoisPerCubicInch',
      label: 'ounce (avoirdupois) per cubic inch',
      symbol: 'oz/in³',
      code: 'L39',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '1.729994 × 10³ kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'massDensity',
        'volumicMass',
        'density'
      ]
    },
    ounceAvoirdupoisPerCubicYard: {
      name: 'ounceAvoirdupoisPerCubicYard',
      label: 'ounce (avoirdupois) per cubic yard',
      symbol: 'oz/yd³',
      code: 'G32',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    ounceAvoirdupoisPerDay: {
      name: 'ounceAvoirdupoisPerDay',
      label: 'ounce (avoirdupois) per day',
      symbol: 'oz/d',
      code: 'L33',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '3.281194 × 10⁻⁷kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    ounceAvoirdupoisPerGallonUk: {
      name: 'ounceAvoirdupoisPerGallonUk',
      label: 'ounce (avoirdupois) per gallon (UK)',
      symbol: 'oz/gal (UK)',
      code: 'L37',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '6.236023 kg/m³',
      quantityKinds: [
        'density',
        'volumicMass',
        'massDensity',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    ounceAvoirdupoisPerGallonUs: {
      name: 'ounceAvoirdupoisPerGallonUs',
      label: 'ounce (avoirdupois) per gallon (US)',
      symbol: 'oz/gal (US)',
      code: 'L38',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '7.489152 kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'density',
        'volumicMass',
        'massDensity'
      ]
    },
    ounceAvoirdupoisPerHour: {
      name: 'ounceAvoirdupoisPerHour',
      label: 'ounce (avoirdupois) per hour',
      symbol: 'oz/h',
      code: 'L34',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '7.874867 × 10⁻⁶ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    ounceAvoirdupoisPerMinute: {
      name: 'ounceAvoirdupoisPerMinute',
      label: 'ounce (avoirdupois) per minute',
      symbol: 'oz/min',
      code: 'L35',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '4.72492 × 10⁻⁴ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    ounceAvoirdupoisPerSecond: {
      name: 'ounceAvoirdupoisPerSecond',
      label: 'ounce (avoirdupois) per second',
      symbol: 'oz/s',
      code: 'L36',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '2.834952 × 10⁻² kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    ounceAvoirdupoisPerSquareInch: {
      name: 'ounceAvoirdupoisPerSquareInch',
      label: 'ounce (avoirdupois) per square inch',
      symbol: 'oz/in²',
      code: 'N22',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '4.394185 × 10 kg/m²',
      quantityKinds: [
        'surfaceDensity',
        'meanMassRange',
        'areicMass',
        'normalStress',
        'bulkModulus',
        'shearStress',
        'shearModulus',
        'modulusOfCompression',
        'modulusOfElasticity',
        'pressure',
        'modulusOfRigidity'
      ]
    },
    ounceFoot: {
      name: 'ounceFoot',
      label: 'ounce foot',
      symbol: 'oz·ft',
      code: '4R',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetre'];
      },
      conversionFactor: '8.640934 × 10⁻³ kg × m',
      quantityKinds: ['torque', 'momentOfACouple', 'momentOfForce', 'torque', 'momentOfForce', 'momentOfACouple']
    },
    ounceInch: {
      name: 'ounceInch',
      label: 'ounce inch',
      symbol: 'oz·in',
      code: '4Q',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetre'];
      },
      conversionFactor: '7.200778 × 10⁻⁴ kg × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple', 'momentOfForce', 'momentOfACouple', 'torque']
    },
    ouncePerSquareFoot: {
      name: 'ouncePerSquareFoot',
      label: 'ounce per square foot',
      symbol: 'oz/ft²',
      code: '37',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '0.3051517 kg/m²',
      quantityKinds: ['surfaceDensity', 'areicMass', 'surfaceDensity', 'meanMassRange', 'areicMass']
    },
    ouncePerSquareFootPer0point01inch: {
      name: 'ouncePerSquareFootPer0point01inch',
      label: 'ounce per square foot per 0,01inch',
      symbol: 'oz/(ft²/cin)',
      code: '38',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    ouncePerSquareYard: {
      name: 'ouncePerSquareYard',
      label: 'ounce per square yard',
      symbol: 'oz/yd²',
      code: 'ON',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '3.390575 × 10⁻² kg/m²',
      quantityKinds: ['surfaceDensity', 'areicMass', 'surfaceDensity', 'meanMassRange', 'areicMass']
    },
    ounceUkFluidPerDay: {
      name: 'ounceUkFluidPerDay',
      label: 'ounce (UK fluid) per day',
      symbol: 'fl oz (UK)/d',
      code: 'J95',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.288549 × 10⁻¹⁰ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    ounceUkFluidPerHour: {
      name: 'ounceUkFluidPerHour',
      label: 'ounce (UK fluid) per hour',
      symbol: 'fl oz (UK)/h',
      code: 'J96',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '7.892517 × 10⁻⁹ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    ounceUkFluidPerMinute: {
      name: 'ounceUkFluidPerMinute',
      label: 'ounce (UK fluid) per minute',
      symbol: 'fl oz (UK)/min',
      code: 'J97',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.73551 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    ounceUkFluidPerSecond: {
      name: 'ounceUkFluidPerSecond',
      label: 'ounce (UK fluid) per second',
      symbol: 'fl oz (UK)/s',
      code: 'J98',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.841306 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    ounceUsFluidPerDay: {
      name: 'ounceUsFluidPerDay',
      label: 'ounce (US fluid) per day',
      symbol: 'fl oz (US)/d',
      code: 'J99',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.422862 × 10⁻¹⁰ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    ounceUsFluidPerHour: {
      name: 'ounceUsFluidPerHour',
      label: 'ounce (US fluid) per hour',
      symbol: 'fl oz (US)/h',
      code: 'K10',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '8.214869 × 10⁻⁹ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    ounceUsFluidPerMinute: {
      name: 'ounceUsFluidPerMinute',
      label: 'ounce (US fluid) per minute',
      symbol: 'fl oz (US)/min',
      code: 'K11',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.928922 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    ounceUsFluidPerSecond: {
      name: 'ounceUsFluidPerSecond',
      label: 'ounce (US fluid) per second',
      symbol: 'fl oz (US)/s',
      code: 'K12',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.957353 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    outfit: {
      name: 'outfit',
      label: 'outfit',
      symbol: null,
      code: '11',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    overtimeHour: {
      name: 'overtimeHour',
      label: 'overtime hour',
      symbol: null,
      code: 'OT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    ozoneDepletionEquivalent: {
      name: 'ozoneDepletionEquivalent',
      label: 'ozone depletion equivalent',
      symbol: null,
      code: 'ODE',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pad: {
      name: 'pad',
      label: 'pad',
      symbol: null,
      code: 'PD',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    page: {
      name: 'page',
      label: 'page',
      symbol: null,
      code: 'ZP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pageFacsimile: {
      name: 'pageFacsimile',
      label: 'page - facsimile',
      symbol: null,
      code: 'QA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pageHardcopy: {
      name: 'pageHardcopy',
      label: 'page - hardcopy',
      symbol: null,
      code: 'QB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pagePerInch: {
      name: 'pagePerInch',
      label: 'page per inch',
      symbol: 'ppi',
      code: 'PQ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pair: {
      name: 'pair',
      label: 'pair',
      symbol: null,
      code: 'PR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    panel: {
      name: 'panel',
      label: 'panel',
      symbol: null,
      code: 'OA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    parsec: {
      name: 'parsec',
      label: 'parsec',
      symbol: 'pc',
      code: 'C63',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '3.085678 × 10¹⁶ m',
      quantityKinds: [
        'height',
        'length',
        'thickness',
        'breadth',
        'lengthOfPath',
        'radiusOfCurvature',
        'radius',
        'diameter',
        'distance',
        'cartesianCoordinates',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    partPerBillionUs: {
      name: 'partPerBillionUs',
      label: 'part per billion (US)',
      symbol: 'ppb',
      code: '61',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    partPerHundredThousand: {
      name: 'partPerHundredThousand',
      label: 'part per hundred thousand',
      symbol: 'ppht',
      code: 'E40',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    partPerMillion: {
      name: 'partPerMillion',
      label: 'part per million',
      symbol: 'ppm',
      code: '59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    partPerQuadrillionUs: {
      name: 'partPerQuadrillionUs',
      label: 'Part per quadrillion (US)',
      symbol: 'ppq',
      code: null,
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    partPerThousand: {
      name: 'partPerThousand',
      label: 'part per thousand',
      symbol: '‰',
      code: 'NX',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    partPerTrillionUs: {
      name: 'partPerTrillionUs',
      label: 'part per trillion (US)',
      symbol: 'ppt',
      code: null,
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pascal: {
      name: 'pascal',
      label: 'pascal',
      symbol: 'Pa',
      code: 'PAL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure'
      ]
    },
    pascalCubicMetrePerSecond: {
      name: 'pascalCubicMetrePerSecond',
      label: 'pascal cubic metre per second',
      symbol: 'Pa·m³/s',
      code: 'G01',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'bulkModulus',
        'modulusOfCompression',
        'shearModulus',
        'pressure',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'shearStress',
        'normalStress'
      ]
    },
    pascalLitrePerSecond: {
      name: 'pascalLitrePerSecond',
      label: 'pascal litre per second',
      symbol: 'Pa·l/s',
      code: 'F99',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'normalStress',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'pressure',
        'shearModulus',
        'modulusOfCompression',
        'shearStress',
        'bulkModulus'
      ]
    },
    pascalPerBar: {
      name: 'pascalPerBar',
      label: 'pascal per bar',
      symbol: 'Pa/bar',
      code: 'F07',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureRatio']
    },
    pascalPerKelvin: {
      name: 'pascalPerKelvin',
      label: 'pascal per kelvin',
      symbol: 'Pa/K',
      code: 'C64',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureCoefficient']
    },
    pascalPerMetre: {
      name: 'pascalPerMetre',
      label: 'pascal per metre',
      symbol: 'Pa/m',
      code: 'H42',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    pascalSecond: {
      name: 'pascalSecond',
      label: 'pascal second',
      symbol: 'Pa·s',
      code: 'C65',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['viscosityDynamicViscosity']
    },
    pascalSecondPerBar: {
      name: 'pascalSecondPerBar',
      label: 'pascal second per bar',
      symbol: 'Pa·s/bar',
      code: 'H07',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁵ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'modulusOfCompression',
        'bulkModulus',
        'modulusOfRigidity',
        'modulusOfElasticity',
        'normalStress',
        'shearStress',
        'pressure',
        'shearModulus'
      ]
    },
    pascalSecondPerCubicMetre: {
      name: 'pascalSecondPerCubicMetre',
      label: 'pascal second per cubic metre',
      symbol: 'Pa·s/m³',
      code: 'C66',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['acousticImpedance']
    },
    pascalSecondPerKelvin: {
      name: 'pascalSecondPerKelvin',
      label: 'pascal second per kelvin',
      symbol: 'Pa.s/K',
      code: 'F77',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'modulusOfRigidity',
        'shearModulus',
        'bulkModulus',
        'shearStress',
        'modulusOfCompression',
        'normalStress',
        'modulusOfElasticity',
        'pressure'
      ]
    },
    pascalSecondPerLitre: {
      name: 'pascalSecondPerLitre',
      label: 'pascal second per litre',
      symbol: 'Pa·s/l',
      code: 'M32',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecondPerCubicMetre'];
      },
      conversionFactor: '10³ Pa × s/m³',
      quantityKinds: ['acousticImpedance', 'acousticImpedance']
    },
    pascalSecondPerMetre: {
      name: 'pascalSecondPerMetre',
      label: 'pascal second per metre',
      symbol: 'Pa· s/m',
      code: 'C67',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['characteristicImpedanceOfAMedium']
    },
    pascalSquareMetrePerKilogram: {
      name: 'pascalSquareMetrePerKilogram',
      label: 'pascal square metre per kilogram',
      symbol: 'Pa/(kg/m²)',
      code: 'P79',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: 'm/s²',
      quantityKinds: [
        'burstIndex',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    pascalSquaredSecond: {
      name: 'pascalSquaredSecond',
      label: 'pascal squared second',
      symbol: 'Pa²·s',
      code: 'P42',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['soundExposure']
    },
    pascalToThePowerSumOfStoichiometricNumbers: {
      name: 'pascalToThePowerSumOfStoichiometricNumbers',
      label: 'pascal to the power sum of stoichiometric numbers',
      symbol: 'PaΣνB',
      code: 'P98',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pebibitPerCubicMetre: {
      name: 'pebibitPerCubicMetre',
      label: 'pebibit per cubic metre',
      symbol: 'Pibit/m³',
      code: 'E82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pebibitPerMetre: {
      name: 'pebibitPerMetre',
      label: 'pebibit per metre',
      symbol: 'Pibit/m',
      code: 'E80',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pebibitPerSquareMetre: {
      name: 'pebibitPerSquareMetre',
      label: 'pebibit per square metre',
      symbol: 'Pibit/m²',
      code: 'E81',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pebibyte: {
      name: 'pebibyte',
      label: 'pebibyte',
      symbol: 'PiB',
      code: 'E60',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '2⁵⁰ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    peck: {
      name: 'peck',
      label: 'peck',
      symbol: 'pk (US)',
      code: 'G23',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '8.809768 × 10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    peckUk: {
      name: 'peckUk',
      label: 'peck (UK)',
      symbol: 'pk (UK)',
      code: 'L43',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '9.092181 × 10⁻³ m³',
      quantityKinds: ['volume', 'sectionModulus', 'volume']
    },
    peckUkPerDay: {
      name: 'peckUkPerDay',
      label: 'peck (UK) per day',
      symbol: 'pk (UK)/d',
      code: 'L44',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.052336 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    peckUkPerHour: {
      name: 'peckUkPerHour',
      label: 'peck (UK) per hour',
      symbol: 'pk (UK)/h',
      code: 'L45',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.525606 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    peckUkPerMinute: {
      name: 'peckUkPerMinute',
      label: 'peck (UK) per minute',
      symbol: 'pk (UK)/min',
      code: 'L46',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.5153635 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    peckUkPerSecond: {
      name: 'peckUkPerSecond',
      label: 'peck (UK) per second',
      symbol: 'pk (UK)/s',
      code: 'L47',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '9.092181 × 10⁻³ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    peckUsDryPerDay: {
      name: 'peckUsDryPerDay',
      label: 'peck (US dry) per day',
      symbol: 'pk (US dry)/d',
      code: 'L48',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.019649 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    peckUsDryPerHour: {
      name: 'peckUsDryPerHour',
      label: 'peck (US dry) per hour',
      symbol: 'pk (US dry)/h',
      code: 'L49',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.447158 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    peckUsDryPerMinute: {
      name: 'peckUsDryPerMinute',
      label: 'peck (US dry) per minute',
      symbol: 'pk (US dry)/min',
      code: 'L50',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.468295 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    peckUsDryPerSecond: {
      name: 'peckUsDryPerSecond',
      label: 'peck (US dry) per second',
      symbol: 'pk (US dry)/s',
      code: 'L51',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '8.809768 × 10⁻³ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    penCalorie: {
      name: 'penCalorie',
      label: 'pen calorie',
      symbol: null,
      code: 'N1',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    penGramProtein: {
      name: 'penGramProtein',
      label: 'pen gram (protein)',
      symbol: null,
      code: 'D23',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pennyweight: {
      name: 'pennyweight',
      label: 'pennyweight',
      symbol: null,
      code: 'DWT',
      referenceUnit: function () {
        return sammUDefinition.units['gram'];
      },
      conversionFactor: '1.555174 g',
      quantityKinds: ['mass']
    },
    perMillePerPsi: {
      name: 'perMillePerPsi',
      label: 'per mille per psi',
      symbol: '‰/psi',
      code: 'J12',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalPascalOrPascalToThePowerMinusOne'];
      },
      conversionFactor: '1.450377 × 10⁻⁷ Pa⁻¹',
      quantityKinds: ['isothermalCompressibility', 'compressibility', 'bulkCompressibility', 'isentropicCompressibility']
    },
    percent: {
      name: 'percent',
      label: 'percent',
      symbol: '%',
      code: 'P1',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['dimensionless']
    },
    percentPerBar: {
      name: 'percentPerBar',
      label: 'percent per bar',
      symbol: '%/bar',
      code: 'H96',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalPascalOrPascalToThePowerMinusOne'];
      },
      conversionFactor: '10⁻⁷ Pa⁻¹',
      quantityKinds: ['isothermalCompressibility', 'compressibility', 'bulkCompressibility', 'isentropicCompressibility']
    },
    percentPerDecakelvin: {
      name: 'percentPerDecakelvin',
      label: 'percent per decakelvin',
      symbol: '%/daK',
      code: 'H73',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalKelvinOrKelvinToThePowerMinusOne'];
      },
      conversionFactor: '10⁻³ K⁻¹',
      quantityKinds: ['relativePressureCoefficient', 'linearExpansionCoefficient', 'cubicExpansionCoefficient']
    },
    percentPerDegree: {
      name: 'percentPerDegree',
      label: 'percent per degree',
      symbol: '%/°',
      code: 'H90',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerDegreeCelsius: {
      name: 'percentPerDegreeCelsius',
      label: 'percent per degree Celsius',
      symbol: '%/°C',
      code: 'M25',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerHectobar: {
      name: 'percentPerHectobar',
      label: 'percent per hectobar',
      symbol: '%/hbar',
      code: 'H72',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerHundred: {
      name: 'percentPerHundred',
      label: 'percent per hundred',
      symbol: '%/100',
      code: 'H93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerInch: {
      name: 'percentPerInch',
      label: 'percent per inch',
      symbol: '%/in',
      code: 'H98',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalMetre'];
      },
      conversionFactor: '0.3937008 m⁻¹',
      quantityKinds: [
        'repetency',
        'curvature',
        'totalIonizationByAParticle',
        'macroscopicTotalCrossSection',
        'wavenumber',
        'phaseCoefficient',
        'waveNumber',
        'volumicCrossSection',
        'rydbergConstant',
        'linearIonizationByAParticle',
        'attenuationCoefficient',
        'lensPower',
        'vergence',
        'linearAttenuationCoefficient',
        'angularReciprocalLatticeVector',
        'propagationCoefficient',
        'angularWaveNumber',
        'linearExtinctionCoefficient',
        'fundamentalReciprocalLatticeVector',
        'angularRepetency',
        'volumicTotalCrossSection',
        'macroscopicCrossSection',
        'linearAbsorptionCoefficient'
      ]
    },
    percentPerKelvin: {
      name: 'percentPerKelvin',
      label: 'percent per kelvin',
      symbol: '%/K',
      code: 'H25',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalKelvinOrKelvinToThePowerMinusOne'];
      },
      conversionFactor: '10⁻² K⁻¹',
      quantityKinds: ['relativePressureCoefficient', 'linearExpansionCoefficient', 'cubicExpansionCoefficient']
    },
    percentPerMetre: {
      name: 'percentPerMetre',
      label: 'percent per metre',
      symbol: '%/m',
      code: 'H99',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalMetre'];
      },
      conversionFactor: '10⁻² m⁻¹',
      quantityKinds: [
        'repetency',
        'curvature',
        'totalIonizationByAParticle',
        'macroscopicTotalCrossSection',
        'wavenumber',
        'phaseCoefficient',
        'waveNumber',
        'volumicCrossSection',
        'rydbergConstant',
        'linearIonizationByAParticle',
        'attenuationCoefficient',
        'lensPower',
        'vergence',
        'linearAttenuationCoefficient',
        'angularReciprocalLatticeVector',
        'propagationCoefficient',
        'angularWaveNumber',
        'linearExtinctionCoefficient',
        'fundamentalReciprocalLatticeVector',
        'angularRepetency',
        'volumicTotalCrossSection',
        'macroscopicCrossSection',
        'linearAbsorptionCoefficient'
      ]
    },
    percentPerMillimetre: {
      name: 'percentPerMillimetre',
      label: 'percent per millimetre',
      symbol: '%/mm',
      code: 'J10',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalMetre'];
      },
      conversionFactor: '10 m⁻¹',
      quantityKinds: [
        'repetency',
        'curvature',
        'totalIonizationByAParticle',
        'macroscopicTotalCrossSection',
        'wavenumber',
        'phaseCoefficient',
        'waveNumber',
        'volumicCrossSection',
        'rydbergConstant',
        'linearIonizationByAParticle',
        'attenuationCoefficient',
        'lensPower',
        'vergence',
        'linearAttenuationCoefficient',
        'angularReciprocalLatticeVector',
        'propagationCoefficient',
        'angularWaveNumber',
        'linearExtinctionCoefficient',
        'fundamentalReciprocalLatticeVector',
        'angularRepetency',
        'volumicTotalCrossSection',
        'macroscopicCrossSection',
        'linearAbsorptionCoefficient'
      ]
    },
    percentPerMonth: {
      name: 'percentPerMonth',
      label: 'percent per month',
      symbol: '%/mo',
      code: 'H71',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerOhm: {
      name: 'percentPerOhm',
      label: 'percent per ohm',
      symbol: '%/Ω',
      code: 'H89',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerOneHundredThousand: {
      name: 'percentPerOneHundredThousand',
      label: 'percent per one hundred thousand',
      symbol: '%/100000',
      code: 'H92',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerTenThousand: {
      name: 'percentPerTenThousand',
      label: 'percent per ten thousand',
      symbol: '%/10000',
      code: 'H91',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerThousand: {
      name: 'percentPerThousand',
      label: 'percent per thousand',
      symbol: '%/1000',
      code: 'H94',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentPerVolt: {
      name: 'percentPerVolt',
      label: 'percent per volt',
      symbol: '%/V',
      code: 'H95',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentVolume: {
      name: 'percentVolume',
      label: 'percent volume',
      symbol: null,
      code: 'VP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    percentWeight: {
      name: 'percentWeight',
      label: 'percent weight',
      symbol: null,
      code: '60',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    perm0Degreesc: {
      name: 'perm0Degreesc',
      label: 'perm (0 °C)',
      symbol: 'perm (0 °C)',
      code: 'P91',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetrePascalSecond'];
      },
      conversionFactor: '5.72135 × 10⁻¹¹ kg/(m² × Pa × s)',
      quantityKinds: null
    },
    perm23Degreesc: {
      name: 'perm23Degreesc',
      label: 'perm (23 °C)',
      symbol: 'perm (23 °C)',
      code: 'P92',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetrePascalSecond'];
      },
      conversionFactor: '5.74525 × 10⁻¹¹ kg/(m² × Pa × s)',
      quantityKinds: null
    },
    person: {
      name: 'person',
      label: 'person',
      symbol: null,
      code: 'IE',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    petabit: {
      name: 'petabit',
      label: 'petabit',
      symbol: 'Pbit',
      code: 'E78',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    petabitPerSecond: {
      name: 'petabitPerSecond',
      label: 'petabit per second',
      symbol: 'Pbit/s',
      code: 'E79',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    petabyte: {
      name: 'petabyte',
      label: 'petabyte',
      symbol: 'Pbyte',
      code: 'E36',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '10¹⁵ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    petajoule: {
      name: 'petajoule',
      label: 'petajoule',
      symbol: 'PJ',
      code: 'C68',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10¹⁵ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'energy',
        'kineticEnergy',
        'work',
        'potentialEnergy'
      ]
    },
    pferdestaerke: {
      name: 'pferdestaerke',
      label: 'Pferdestaerke',
      symbol: 'PS',
      code: 'N12',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '7.354988 × 10² W',
      quantityKinds: [
        'power',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    pfund: {
      name: 'pfund',
      label: 'pfund',
      symbol: 'pfd',
      code: 'M86',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '0.5 kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    phon: {
      name: 'phon',
      label: 'phon',
      symbol: null,
      code: 'C69',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['loudnessLevel']
    },
    phot: {
      name: 'phot',
      label: 'phot',
      symbol: 'ph',
      code: 'P26',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['illuminance']
    },
    pica: {
      name: 'pica',
      label: 'pica',
      symbol: null,
      code: 'R1',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '4.217518 × 10⁻³ m',
      quantityKinds: [
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    picoampere: {
      name: 'picoampere',
      label: 'picoampere',
      symbol: 'pA',
      code: 'C70',
      referenceUnit: function () {
        return sammUDefinition.units['ampere'];
      },
      conversionFactor: '10⁻¹² A',
      quantityKinds: [
        'currentLinkage',
        'electricCurrent',
        'magnetomotiveForce',
        'magneticPotentialDifference',
        'magneticPotentialDifference',
        'magnetomotiveForce',
        'currentLinkage',
        'electricCurrent'
      ]
    },
    picocoulomb: {
      name: 'picocoulomb',
      label: 'picocoulomb',
      symbol: 'pC',
      code: 'C71',
      referenceUnit: function () {
        return sammUDefinition.units['coulomb'];
      },
      conversionFactor: '10⁻¹² C',
      quantityKinds: [
        'elementaryCharge',
        'quantityOfElectricity',
        'electricFluxFluxOfDisplacement',
        'electricCharge',
        'quantityOfElectricity',
        'electricCharge',
        'electricFluxFluxOfDisplacement'
      ]
    },
    picofarad: {
      name: 'picofarad',
      label: 'picofarad',
      symbol: 'pF',
      code: '4T',
      referenceUnit: function () {
        return sammUDefinition.units['farad'];
      },
      conversionFactor: '10⁻¹² F',
      quantityKinds: ['capacitance', 'capacitance']
    },
    picofaradPerMetre: {
      name: 'picofaradPerMetre',
      label: 'picofarad per metre',
      symbol: 'pF/m',
      code: 'C72',
      referenceUnit: function () {
        return sammUDefinition.units['faradPerMetre'];
      },
      conversionFactor: '10⁻¹² F/m',
      quantityKinds: [
        'permittivityOfVacuum',
        'permittivity',
        'electricConstant',
        'permittivityOfVacuum',
        'permittivity',
        'electricConstant'
      ]
    },
    picohenry: {
      name: 'picohenry',
      label: 'picohenry',
      symbol: 'pH',
      code: 'C73',
      referenceUnit: function () {
        return sammUDefinition.units['henry'];
      },
      conversionFactor: '10⁻¹² H',
      quantityKinds: ['selfInductance', 'permeance', 'mutualInductance', 'permeance', 'mutualInductance', 'selfInductance']
    },
    picometre: {
      name: 'picometre',
      label: 'picometre',
      symbol: 'pm',
      code: 'C52',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '10⁻¹² m',
      quantityKinds: [
        'breadth',
        'distance',
        'lengthOfPath',
        'length',
        'height',
        'diameter',
        'radius',
        'radiusOfCurvature',
        'thickness',
        'cartesianCoordinates',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    picopascalPerKilometre: {
      name: 'picopascalPerKilometre',
      label: 'picopascal per kilometre',
      symbol: 'pPa/km',
      code: 'H69',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    picosecond: {
      name: 'picosecond',
      label: 'picosecond',
      symbol: 'ps',
      code: 'H70',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻¹² s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    picosiemens: {
      name: 'picosiemens',
      label: 'picosiemens',
      symbol: 'pS',
      code: 'N92',
      referenceUnit: function () {
        return sammUDefinition.units['siemens'];
      },
      conversionFactor: '10⁻¹² S',
      quantityKinds: [
        'admittance',
        'modulusOfAdmittance',
        'conductanceForAlternatingCurrent',
        'conductanceForDirectCurrent',
        'complexAdmittance',
        'complexAdmittance',
        'conductanceForAlternatingCurrent',
        'conductanceForDirectCurrent',
        'modulusOfAdmittance',
        'admittance'
      ]
    },
    picosiemensPerMetre: {
      name: 'picosiemensPerMetre',
      label: 'picosiemens per metre',
      symbol: 'pS/m',
      code: 'L42',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10⁻¹² S/m',
      quantityKinds: ['electrolyticConductivity', 'conductivity', 'conductivity']
    },
    picovolt: {
      name: 'picovolt',
      label: 'picovolt',
      symbol: 'pV',
      code: 'N99',
      referenceUnit: function () {
        return sammUDefinition.units['volt'];
      },
      conversionFactor: '10⁻¹² V',
      quantityKinds: [
        'voltage',
        'potentialDifference',
        'electromotiveForce',
        'tension',
        'electricPotential',
        'thermoelectromotiveForceBetweenSubstancesAAndB',
        'electricPotential',
        'peltierCoefficientForSubstancesAAndB',
        'electromotiveForce',
        'potentialDifference',
        'tension',
        'voltage'
      ]
    },
    picowatt: {
      name: 'picowatt',
      label: 'picowatt',
      symbol: 'pW',
      code: 'C75',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10⁻¹² W',
      quantityKinds: [
        'powerForDirectCurrent',
        'activePower',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    picowattPerSquareMetre: {
      name: 'picowattPerSquareMetre',
      label: 'picowatt per square metre',
      symbol: 'pW/m²',
      code: 'C76',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '10⁻¹² W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'soundIntensity'
      ]
    },
    piece: {
      name: 'piece',
      label: 'piece',
      symbol: null,
      code: 'H87',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    ping: {
      name: 'ping',
      label: 'ping',
      symbol: null,
      code: 'E19',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '3.305 m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection'
      ]
    },
    pintUk: {
      name: 'pintUk',
      label: 'pint (UK)',
      symbol: 'pt (UK)',
      code: 'PTI',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '5. 68261 × 10⁻⁴ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    pintUkPerDay: {
      name: 'pintUkPerDay',
      label: 'pint (UK) per day',
      symbol: 'pt (UK)/d',
      code: 'L53',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '6.577098 × 10⁻⁹ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    pintUkPerHour: {
      name: 'pintUkPerHour',
      label: 'pint (UK) per hour',
      symbol: 'pt (UK)/h',
      code: 'L54',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.578504 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    pintUkPerMinute: {
      name: 'pintUkPerMinute',
      label: 'pint (UK) per minute',
      symbol: 'pt (UK)/min',
      code: 'L55',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '9.471022 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    pintUkPerSecond: {
      name: 'pintUkPerSecond',
      label: 'pint (UK) per second',
      symbol: 'pt (UK)/s',
      code: 'L56',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '5.682613 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    pintUsLiquidPerDay: {
      name: 'pintUsLiquidPerDay',
      label: 'pint (US liquid) per day',
      symbol: 'pt (US liq.)/d',
      code: 'L57',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '5.476580 × 10⁻⁹ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    pintUsLiquidPerHour: {
      name: 'pintUsLiquidPerHour',
      label: 'pint (US liquid) per hour',
      symbol: 'pt (US liq.)/h',
      code: 'L58',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.314379 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    pintUsLiquidPerMinute: {
      name: 'pintUsLiquidPerMinute',
      label: 'pint (US liquid) per minute',
      symbol: 'pt (US liq.)/min',
      code: 'L59',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '7.886275 × 10⁻⁶ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    pintUsLiquidPerSecond: {
      name: 'pintUsLiquidPerSecond',
      label: 'pint (US liquid) per second',
      symbol: 'pt (US liq.)/s',
      code: 'L60',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '4.731765 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    pipelineJoint: {
      name: 'pipelineJoint',
      label: 'pipeline joint',
      symbol: null,
      code: 'JNT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pitch: {
      name: 'pitch',
      label: 'pitch',
      symbol: null,
      code: 'PI',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    pixel: {
      name: 'pixel',
      label: 'pixel',
      symbol: null,
      code: 'E37',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    poise: {
      name: 'poise',
      label: 'poise',
      symbol: 'P',
      code: '89',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '0.1 Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    poisePerBar: {
      name: 'poisePerBar',
      label: 'poise per bar',
      symbol: 'P/bar',
      code: 'F06',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁶ s',
      quantityKinds: [
        'viscosityDynamicViscosity',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    poisePerKelvin: {
      name: 'poisePerKelvin',
      label: 'poise per kelvin',
      symbol: 'P/K',
      code: 'F86',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['viscosityDynamicViscosity']
    },
    poisePerPascal: {
      name: 'poisePerPascal',
      label: 'poise per pascal',
      symbol: 'P/Pa',
      code: 'N35',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '0.1 s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'viscosityDynamicViscosity'
      ]
    },
    pond: {
      name: 'pond',
      label: 'pond',
      symbol: 'p',
      code: 'M78',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '9.80665 × 10⁻³ N',
      quantityKinds: ['force', 'weight', 'weight', 'force']
    },
    pound: {
      name: 'pound',
      label: 'pound',
      symbol: 'lb',
      code: 'LBR',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '0.45359237 kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    poundAvoirdupoisPerCubicFootDegreeFahrenheit: {
      name: 'poundAvoirdupoisPerCubicFootDegreeFahrenheit',
      label: 'pound (avoirdupois) per cubic foot degree Fahrenheit',
      symbol: '(lb/ft³)/°F',
      code: 'K69',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    poundAvoirdupoisPerCubicFootPsi: {
      name: 'poundAvoirdupoisPerCubicFootPsi',
      label: 'pound (avoirdupois) per cubic foot psi',
      symbol: '(lb/ft³)/psi',
      code: 'K70',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    poundAvoirdupoisPerCubicInchDegreeFahrenheit: {
      name: 'poundAvoirdupoisPerCubicInchDegreeFahrenheit',
      label: 'pound (avoirdupois) per cubic inch degree Fahrenheit',
      symbol: '(lb/in³)/°F',
      code: 'K75',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    poundAvoirdupoisPerCubicInchPsi: {
      name: 'poundAvoirdupoisPerCubicInchPsi',
      label: 'pound (avoirdupois) per cubic inch psi',
      symbol: '(lb/in³)/psi',
      code: 'K76',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetrePascal'];
      },
      conversionFactor: '4.014632 (kg/m³)/Pa',
      quantityKinds: ['volumicMass', 'massDensity', 'density', 'massDensity', 'volumicMass', 'density']
    },
    poundAvoirdupoisPerDay: {
      name: 'poundAvoirdupoisPerDay',
      label: 'pound (avoirdupois) per day',
      symbol: 'lb/d',
      code: 'K66',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '5.249912 × 10⁻⁶ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    poundAvoirdupoisPerDegreeFahrenheit: {
      name: 'poundAvoirdupoisPerDegreeFahrenheit',
      label: 'pound (avoirdupois) per degree Fahrenheit',
      symbol: 'lb/°F',
      code: 'K64',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerKelvin'];
      },
      conversionFactor: '0.8164663 kg/K',
      quantityKinds: ['mass', 'volumicMass', 'massDensity', 'density']
    },
    poundAvoirdupoisPerGallonUk: {
      name: 'poundAvoirdupoisPerGallonUk',
      label: 'pound (avoirdupois) per gallon (UK)',
      symbol: 'lb/gal (UK)',
      code: 'K71',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '99.77637 kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'volumicMass',
        'massDensity',
        'density'
      ]
    },
    poundAvoirdupoisPerHourDegreeFahrenheit: {
      name: 'poundAvoirdupoisPerHourDegreeFahrenheit',
      label: 'pound (avoirdupois) per hour degree Fahrenheit',
      symbol: '(lb/h)/°F',
      code: 'K73',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    poundAvoirdupoisPerHourPsi: {
      name: 'poundAvoirdupoisPerHourPsi',
      label: 'pound (avoirdupois) per hour psi',
      symbol: '(lb/h)/psi',
      code: 'K74',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecondPascal'];
      },
      conversionFactor: '1.827445 × 10⁻⁸ (kg/s)/Pa',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    poundAvoirdupoisPerMinute: {
      name: 'poundAvoirdupoisPerMinute',
      label: 'pound (avoirdupois) per minute',
      symbol: 'lb/min',
      code: 'K78',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '7.559873 × 10⁻³ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    poundAvoirdupoisPerMinuteDegreeFahrenheit: {
      name: 'poundAvoirdupoisPerMinuteDegreeFahrenheit',
      label: 'pound (avoirdupois) per minute degree Fahrenheit',
      symbol: 'lb/(min·°F)',
      code: 'K79',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    poundAvoirdupoisPerMinutePsi: {
      name: 'poundAvoirdupoisPerMinutePsi',
      label: 'pound (avoirdupois) per minute psi',
      symbol: '(lb/min)/psi',
      code: 'K80',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecondPascal'];
      },
      conversionFactor: '1.096467 × 10⁻⁶ (kg/s)/Pa',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    poundAvoirdupoisPerPsi: {
      name: 'poundAvoirdupoisPerPsi',
      label: 'pound (avoirdupois) per psi',
      symbol: 'lb/psi',
      code: 'K77',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerPascal'];
      },
      conversionFactor: '6.578802 × 10⁻⁵ kg/Pa',
      quantityKinds: ['volumicMass', 'massDensity', 'density', 'volumicMass', 'massDensity', 'density']
    },
    poundAvoirdupoisPerSecond: {
      name: 'poundAvoirdupoisPerSecond',
      label: 'pound (avoirdupois) per second',
      symbol: 'lb/s',
      code: 'K81',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '0.4535924 kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    poundAvoirdupoisPerSecondDegreeFahrenheit: {
      name: 'poundAvoirdupoisPerSecondDegreeFahrenheit',
      label: 'pound (avoirdupois) per second degree Fahrenheit',
      symbol: '(lb/s)/°F',
      code: 'K82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    poundAvoirdupoisPerSecondPsi: {
      name: 'poundAvoirdupoisPerSecondPsi',
      label: 'pound (avoirdupois) per second psi',
      symbol: '(lb/s)/psi',
      code: 'K83',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecondPascal'];
      },
      conversionFactor: '6.578802 × 10⁻⁵ (kg/s)/Pa',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    poundAvoirdupoisSquareFoot: {
      name: 'poundAvoirdupoisSquareFoot',
      label: 'pound (avoirdupois) square foot',
      symbol: 'lb·ft²',
      code: 'K65',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetreSquared'];
      },
      conversionFactor: '4.214011 × 10⁻² kg × m²',
      quantityKinds: ['momentOfInertiaDynamicMomentOfInertia', 'momentOfInertiaDynamicMomentOfInertia']
    },
    poundFootPerSecond: {
      name: 'poundFootPerSecond',
      label: 'pound foot per second',
      symbol: 'lb·(ft/s)',
      code: 'N10',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetrePerSecond'];
      },
      conversionFactor: '1.382550 × 10⁻¹ kg × m/s',
      quantityKinds: ['momentum', 'momentum']
    },
    poundForce: {
      name: 'poundForce',
      label: 'pound-force',
      symbol: 'lbf',
      code: 'C78',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '4.448222 N',
      quantityKinds: ['weight', 'force', 'weight', 'force']
    },
    poundForceFoot: {
      name: 'poundForceFoot',
      label: 'pound-force foot',
      symbol: 'lbf·ft',
      code: 'M92',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '1.355818 N × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple', 'momentOfForce', 'torque', 'momentOfACouple']
    },
    poundForceFootPerAmpere: {
      name: 'poundForceFootPerAmpere',
      label: 'pound-force foot per ampere',
      symbol: 'lbf·ft/A',
      code: 'F22',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    poundForceFootPerInch: {
      name: 'poundForceFootPerInch',
      label: 'pound-force foot per inch',
      symbol: 'lbf·ft/in',
      code: 'P89',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    poundForceFootPerPound: {
      name: 'poundForceFootPerPound',
      label: 'pound-force foot per pound',
      symbol: 'lbf·ft/lb',
      code: 'G20',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['workPerUnitWeight', 'momentOfForce', 'torque', 'momentOfACouple']
    },
    poundForceInch: {
      name: 'poundForceInch',
      label: 'pound-force inch',
      symbol: 'lbf·in',
      code: 'F21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    poundForceInchPerInch: {
      name: 'poundForceInchPerInch',
      label: 'pound-force inch per inch',
      symbol: 'lbf·in/in',
      code: 'P90',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    poundForcePerFoot: {
      name: 'poundForcePerFoot',
      label: 'pound-force per foot',
      symbol: 'lbf/ft',
      code: 'F17',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['forceDividedByLength']
    },
    poundForcePerInch: {
      name: 'poundForcePerInch',
      label: 'pound-force per inch',
      symbol: 'lbf/in',
      code: 'F48',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['forceDividedByLength']
    },
    poundForcePerSquareFoot: {
      name: 'poundForcePerSquareFoot',
      label: 'pound-force per square foot',
      symbol: 'lbf/ft²',
      code: 'K85',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '47.88026 Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfElasticity',
        'bulkModulus',
        'shearModulus',
        'modulusOfRigidity',
        'normalStress',
        'pressure',
        'modulusOfCompression',
        'shearStress'
      ]
    },
    poundForcePerSquareInch: {
      name: 'poundForcePerSquareInch',
      label: 'pound-force per square inch',
      symbol: 'lbf/in²',
      code: 'PS',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '6.894757 × 10³ Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'bulkModulus',
        'pressure',
        'modulusOfRigidity',
        'modulusOfCompression',
        'shearStress',
        'normalStress',
        'modulusOfElasticity',
        'shearModulus'
      ]
    },
    poundForcePerSquareInchDegreeFahrenheit: {
      name: 'poundForcePerSquareInchDegreeFahrenheit',
      label: 'pound-force per square inch degree Fahrenheit',
      symbol: 'psi/°F',
      code: 'K86',
      referenceUnit: function () {
        return sammUDefinition.units['pascalPerKelvin'];
      },
      conversionFactor: '1.241056 × 10⁴ Pa/K',
      quantityKinds: [
        'pressureCoefficient',
        'bulkModulus',
        'shearModulus',
        'normalStress',
        'modulusOfRigidity',
        'modulusOfCompression',
        'pressure',
        'shearStress',
        'modulusOfElasticity'
      ]
    },
    poundForcePerYard: {
      name: 'poundForcePerYard',
      label: 'pound-force per yard',
      symbol: 'lbf/yd',
      code: 'N33',
      referenceUnit: function () {
        return sammUDefinition.units['newtonPerMetre'];
      },
      conversionFactor: '4.864635 N/m',
      quantityKinds: ['surfaceTension', 'surfaceTension']
    },
    poundForceSecondPerSquareFoot: {
      name: 'poundForceSecondPerSquareFoot',
      label: 'pound-force second per square foot',
      symbol: 'lbf·s/ft²',
      code: 'K91',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '47.88026 Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    poundForceSecondPerSquareInch: {
      name: 'poundForceSecondPerSquareInch',
      label: 'pound-force second per square inch',
      symbol: 'lbf·s/in²',
      code: 'K92',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '6.894757 × 10³ Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    poundInchPerSecond: {
      name: 'poundInchPerSecond',
      label: 'pound inch per second',
      symbol: 'lb·(in/s)',
      code: 'N11',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetrePerSecond'];
      },
      conversionFactor: '1.152125 × 10⁻² kg × m/s',
      quantityKinds: ['momentum', 'momentum']
    },
    poundInchSquared: {
      name: 'poundInchSquared',
      label: 'pound inch squared',
      symbol: 'lb·in²',
      code: 'F20',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetreSquared'];
      },
      conversionFactor: '2.926397 × 10⁻⁴ kg × m²',
      quantityKinds: ['momentOfInertiaDynamicMomentOfInertia', 'momentOfInertiaDynamicMomentOfInertia']
    },
    poundMole: {
      name: 'poundMole',
      label: 'pound mole',
      symbol: 'lbmol',
      code: 'P44',
      referenceUnit: function () {
        return sammUDefinition.units['mole'];
      },
      conversionFactor: '453.5924 mol',
      quantityKinds: ['amountOfSubstance', 'amountOfSubstance']
    },
    poundMolePerMinute: {
      name: 'poundMolePerMinute',
      label: 'pound mole per minute',
      symbol: 'lbmol/h',
      code: 'P46',
      referenceUnit: function () {
        return sammUDefinition.units['molePerSecond'];
      },
      conversionFactor: '7.559873 mol/s',
      quantityKinds: [
        'catalyticActivity',
        'volumicMass',
        'amountOfSubstance',
        'massConcentrationOfB',
        'density',
        'concentrationOfB',
        'massDensity'
      ]
    },
    poundMolePerPound: {
      name: 'poundMolePerPound',
      label: 'pound mole per pound',
      symbol: 'lbmol/lb',
      code: 'P48',
      referenceUnit: function () {
        return sammUDefinition.units['molePerKilogram'];
      },
      conversionFactor: '10³ mol/kg',
      quantityKinds: ['molalityOfSoluteB', 'ionicStrength']
    },
    poundMolePerSecond: {
      name: 'poundMolePerSecond',
      label: 'pound mole per second',
      symbol: 'lbmol/s',
      code: 'P45',
      referenceUnit: function () {
        return sammUDefinition.units['molePerSecond'];
      },
      conversionFactor: '4.535924 × 10² mol/s',
      quantityKinds: [
        'catalyticActivity',
        'volumicMass',
        'amountOfSubstance',
        'massConcentrationOfB',
        'density',
        'concentrationOfB',
        'massDensity'
      ]
    },
    poundPerCubicFoot: {
      name: 'poundPerCubicFoot',
      label: 'pound per cubic foot',
      symbol: 'lb/ft³',
      code: '87',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '1.601846 × 10¹ kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'volumicMass',
        'density',
        'massDensity'
      ]
    },
    poundPerCubicInch: {
      name: 'poundPerCubicInch',
      label: 'pound per cubic inch',
      symbol: 'lb/in³',
      code: 'LA',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '2.767990 × 10⁴ kg/m³',
      quantityKinds: [
        'density',
        'volumicMass',
        'massDensity',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    poundPerCubicYard: {
      name: 'poundPerCubicYard',
      label: 'pound per cubic yard',
      symbol: 'lb/yd³',
      code: 'K84',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '0.5932764 kg/m³',
      quantityKinds: [
        'massDensity',
        'density',
        'volumicMass',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    poundPerFoot: {
      name: 'poundPerFoot',
      label: 'pound per foot',
      symbol: 'lb/ft',
      code: 'P2',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '1.488164 kg/m',
      quantityKinds: ['linearDensity', 'linearMass', 'linearMass', 'linearDensity']
    },
    poundPerFootDay: {
      name: 'poundPerFootDay',
      label: 'pound per foot day',
      symbol: 'lb/(ft·d)',
      code: 'N44',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '1.722412 × 10⁻⁵ Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    poundPerFootHour: {
      name: 'poundPerFootHour',
      label: 'pound per foot hour',
      symbol: 'lb/(ft·h)',
      code: 'K67',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '4.133789 × 10⁻⁴ Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    poundPerFootMinute: {
      name: 'poundPerFootMinute',
      label: 'pound per foot minute',
      symbol: 'lb/(ft·min)',
      code: 'N43',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '2.480273 × 10⁻² Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    poundPerFootSecond: {
      name: 'poundPerFootSecond',
      label: 'pound per foot second',
      symbol: 'lb/(ft·s)',
      code: 'K68',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '1.488164 Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    poundPerGallonUs: {
      name: 'poundPerGallonUs',
      label: 'pound per gallon (US)',
      symbol: 'lb/gal (US)',
      code: 'GE',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '1.198264 × 10² kg/m³',
      quantityKinds: [
        'massDensity',
        'density',
        'volumicMass',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    poundPerHour: {
      name: 'poundPerHour',
      label: 'pound per hour',
      symbol: 'lb/h',
      code: '4U',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '1.259979 × 10⁻⁴ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    poundPerInchOfLengthUnit: {
      name: 'poundPerInchOfLengthUnit',
      label: 'pound per inch of length',
      symbol: 'lb/in',
      code: 'PO',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '1.785797 × 10¹ kg/m',
      quantityKinds: ['linearMass', 'linearDensity', 'linearMass', 'linearDensity']
    },
    poundPerPound: {
      name: 'poundPerPound',
      label: 'pound per pound',
      symbol: 'lb/lb',
      code: 'M91',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massRatio']
    },
    poundPerReam: {
      name: 'poundPerReam',
      label: 'pound per ream',
      symbol: null,
      code: 'RP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    poundPerSquareFoot: {
      name: 'poundPerSquareFoot',
      label: 'pound per square foot',
      symbol: 'lb/ft²',
      code: 'FP',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '4.882428 kg/m²',
      quantityKinds: [
        'shearStress',
        'shearModulus',
        'normalStress',
        'pressure',
        'modulusOfRigidity',
        'bulkModulus',
        'modulusOfElasticity',
        'modulusOfCompression',
        'surfaceDensity',
        'meanMassRange',
        'areicMass'
      ]
    },
    poundPerSquareInchAbsolute: {
      name: 'poundPerSquareInchAbsolute',
      label: 'pound per square inch absolute',
      symbol: 'lb/in²',
      code: '80',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '7.030696 × 10² kg/m²',
      quantityKinds: [
        'shearStress',
        'modulusOfRigidity',
        'modulusOfElasticity',
        'pressure',
        'normalStress',
        'bulkModulus',
        'modulusOfCompression',
        'shearModulus',
        'surfaceDensity',
        'meanMassRange',
        'areicMass'
      ]
    },
    poundPerSquareYard: {
      name: 'poundPerSquareYard',
      label: 'pound per square yard',
      symbol: 'lb/yd²',
      code: 'N25',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSquareMetre'];
      },
      conversionFactor: '5.424919 × 10⁻¹ kg/m²',
      quantityKinds: [
        'modulusOfCompression',
        'normalStress',
        'bulkModulus',
        'shearStress',
        'modulusOfRigidity',
        'shearModulus',
        'pressure',
        'modulusOfElasticity',
        'surfaceDensity',
        'meanMassRange',
        'areicMass'
      ]
    },
    poundPerYard: {
      name: 'poundPerYard',
      label: 'pound per yard',
      symbol: 'lb/yd',
      code: 'M84',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '4.960546 × 10⁻¹ kg/m',
      quantityKinds: ['linearMass', 'linearDensity', 'linearMass', 'linearDensity']
    },
    poundal: {
      name: 'poundal',
      label: 'poundal',
      symbol: 'pdl',
      code: 'M76',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '1.382550 × 10⁻¹ N',
      quantityKinds: ['weight', 'force', 'force', 'weight']
    },
    poundalFoot: {
      name: 'poundalFoot',
      label: 'poundal foot',
      symbol: 'pdl·ft',
      code: 'M95',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '4.214011 × 10⁻² N × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple', 'momentOfForce', 'torque', 'momentOfACouple']
    },
    poundalInch: {
      name: 'poundalInch',
      label: 'poundal inch',
      symbol: 'pdl·in',
      code: 'M96',
      referenceUnit: function () {
        return sammUDefinition.units['newtonMetre'];
      },
      conversionFactor: '3.51167710⁻³ N × m',
      quantityKinds: ['torque', 'momentOfACouple', 'momentOfForce', 'torque', 'momentOfForce', 'momentOfACouple']
    },
    poundalPerInch: {
      name: 'poundalPerInch',
      label: 'poundal per inch',
      symbol: 'pdl/in',
      code: 'N32',
      referenceUnit: function () {
        return sammUDefinition.units['newtonPerMetre'];
      },
      conversionFactor: '5.443110 N/m',
      quantityKinds: ['surfaceTension', 'surfaceTension']
    },
    poundalPerSquareFoot: {
      name: 'poundalPerSquareFoot',
      label: 'poundal per square foot',
      symbol: 'pdl/ft²',
      code: 'N21',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '1.488164 Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'bulkModulus',
        'shearStress',
        'modulusOfRigidity',
        'pressure',
        'modulusOfElasticity',
        'normalStress',
        'modulusOfCompression',
        'shearModulus'
      ]
    },
    poundalPerSquareInch: {
      name: 'poundalPerSquareInch',
      label: 'poundal per square inch',
      symbol: 'pdl/in²',
      code: 'N26',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '2.142957 × 10² Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'modulusOfElasticity',
        'shearModulus',
        'pressure',
        'modulusOfCompression',
        'modulusOfRigidity',
        'shearStress',
        'bulkModulus',
        'normalStress'
      ]
    },
    poundalSecondPerSquareFoot: {
      name: 'poundalSecondPerSquareFoot',
      label: 'poundal second per square foot',
      symbol: '(pdl/ft²)·s',
      code: 'N34',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '1.488164 Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    poundalSecondPerSquareInch: {
      name: 'poundalSecondPerSquareInch',
      label: 'poundal second per square inch',
      symbol: '(pdl/in²)·s',
      code: 'N42',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '2.142957 × 10² Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    printPoint: {
      name: 'printPoint',
      label: 'print point',
      symbol: null,
      code: 'N3',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    proofGallon: {
      name: 'proofGallon',
      label: 'proof gallon',
      symbol: null,
      code: 'PGL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    proofLitre: {
      name: 'proofLitre',
      label: 'proof litre',
      symbol: null,
      code: 'PFL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    psiCubicInchPerSecond: {
      name: 'psiCubicInchPerSecond',
      label: 'psi cubic inch per second',
      symbol: 'psi·in³/s',
      code: 'K87',
      referenceUnit: function () {
        return sammUDefinition.units['pascalCubicMetrePerSecond'];
      },
      conversionFactor: '0.112985 Pa × m³/s',
      quantityKinds: [
        'leakageRateOfGas',
        'bulkModulus',
        'modulusOfCompression',
        'shearModulus',
        'pressure',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'shearStress',
        'normalStress'
      ]
    },
    psiCubicMetrePerSecond: {
      name: 'psiCubicMetrePerSecond',
      label: 'psi cubic metre per second',
      symbol: 'psi·m³/s',
      code: 'K89',
      referenceUnit: function () {
        return sammUDefinition.units['pascalCubicMetrePerSecond'];
      },
      conversionFactor: '6.894757 × 10³ Pa × m³/s',
      quantityKinds: [
        'bulkModulus',
        'modulusOfCompression',
        'shearModulus',
        'pressure',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'shearStress',
        'normalStress',
        'leakageRateOfGas'
      ]
    },
    psiCubicYardPerSecond: {
      name: 'psiCubicYardPerSecond',
      label: 'psi cubic yard per second',
      symbol: 'psi·yd³/s',
      code: 'K90',
      referenceUnit: function () {
        return sammUDefinition.units['pascalCubicMetrePerSecond'];
      },
      conversionFactor: '5.271420 × 10³ Pa × m³/s',
      quantityKinds: [
        'bulkModulus',
        'modulusOfCompression',
        'shearModulus',
        'pressure',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'shearStress',
        'normalStress',
        'leakageRateOfGas'
      ]
    },
    psiLitrePerSecond: {
      name: 'psiLitrePerSecond',
      label: 'psi litre per second',
      symbol: 'psi·l/s',
      code: 'K88',
      referenceUnit: function () {
        return sammUDefinition.units['pascalCubicMetrePerSecond'];
      },
      conversionFactor: '6.894757 Pa × m³/s',
      quantityKinds: [
        'leakageRateOfGas',
        'bulkModulus',
        'modulusOfCompression',
        'shearModulus',
        'pressure',
        'modulusOfElasticity',
        'modulusOfRigidity',
        'shearStress',
        'normalStress'
      ]
    },
    psiPerInch: {
      name: 'psiPerInch',
      label: 'psi per inch',
      symbol: 'psi/in',
      code: 'P86',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    psiPerPsi: {
      name: 'psiPerPsi',
      label: 'psi per psi',
      symbol: 'psi/psi',
      code: 'L52',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['pressureRatio']
    },
    quad1015Btuit: {
      name: 'quad1015Btuit',
      label: 'quad (1015 BtuIT)',
      symbol: 'quad',
      code: 'N70',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.055056 × 10¹⁸ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'thermodynamicEnergy',
        'heat',
        'enthalpy',
        'energy',
        'helmholtzFunction',
        'quantityOfHeat',
        'helmholtzFreeEnergy'
      ]
    },
    quartUk: {
      name: 'quartUk',
      label: 'quart (UK)',
      symbol: 'qt (UK)',
      code: 'QTI',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.1365225 × 10⁻³ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    quartUkLiquidPerDay: {
      name: 'quartUkLiquidPerDay',
      label: 'quart (UK liquid) per day',
      symbol: 'qt (UK liq.)/d',
      code: 'K94',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.315420 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    quartUkLiquidPerHour: {
      name: 'quartUkLiquidPerHour',
      label: 'quart (UK liquid) per hour',
      symbol: 'qt (UK liq.)/h',
      code: 'K95',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '3.157008 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    quartUkLiquidPerMinute: {
      name: 'quartUkLiquidPerMinute',
      label: 'quart (UK liquid) per minute',
      symbol: 'qt (UK liq.)/min',
      code: 'K96',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.894205 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    quartUkLiquidPerSecond: {
      name: 'quartUkLiquidPerSecond',
      label: 'quart (UK liquid) per second',
      symbol: 'qt (UK liq.)/s',
      code: 'K97',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.136523 × 10⁻³ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    quartUsLiquidPerDay: {
      name: 'quartUsLiquidPerDay',
      label: 'quart (US liquid) per day',
      symbol: 'qt (US liq.)/d',
      code: 'K98',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.095316 × 10⁻⁸ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    quartUsLiquidPerHour: {
      name: 'quartUsLiquidPerHour',
      label: 'quart (US liquid) per hour',
      symbol: 'qt (US liq.)/h',
      code: 'K99',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '2.628758 × 10⁻⁷ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    quartUsLiquidPerMinute: {
      name: 'quartUsLiquidPerMinute',
      label: 'quart (US liquid) per minute',
      symbol: 'qt (US liq.)/min',
      code: 'L10',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.577255 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    quartUsLiquidPerSecond: {
      name: 'quartUsLiquidPerSecond',
      label: 'quart (US liquid) per second',
      symbol: 'qt (US liq.)/s',
      code: 'L11',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '9.463529 × 10⁻⁴ m³/s',
      quantityKinds: ['volumeFlowRate', 'volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    quarterOfAYear: {
      name: 'quarterOfAYear',
      label: 'quarter (of a year)',
      symbol: null,
      code: 'QAN',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    quarterUk: {
      name: 'quarterUk',
      label: 'quarter (UK)',
      symbol: 'Qr (UK)',
      code: 'QTR',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '12.700 59 kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    quire: {
      name: 'quire',
      label: 'quire',
      symbol: 'qr',
      code: 'QR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    rackUnit: {
      name: 'rackUnit',
      label: 'rack unit',
      symbol: 'U or RU',
      code: 'H80',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '4.445 × 10⁻² m',
      quantityKinds: [
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    rad: {
      name: 'rad',
      label: 'rad',
      symbol: 'rad',
      code: 'C80',
      referenceUnit: function () {
        return sammUDefinition.units['gray'];
      },
      conversionFactor: '10⁻² Gy',
      quantityKinds: ['absorbedDose', 'specificEnergyImparted', 'massicEnergyImparted']
    },
    radian: {
      name: 'radian',
      label: 'radian',
      symbol: 'rad',
      code: 'C81',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['anglePlane', 'braggAngle', 'phaseDifference', 'angleOfOpticalRotation', 'phaseDisplacement', 'lossAngle']
    },
    radianPerMetre: {
      name: 'radianPerMetre',
      label: 'radian per metre',
      symbol: 'rad/m',
      code: 'C84',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['angularWavenumber', 'angularRepetency', 'debyeAngularRepetency', 'angularWaveNumber', 'debyeAngularWaveNumber']
    },
    radianPerSecond: {
      name: 'radianPerSecond',
      label: 'radian per second',
      symbol: 'rad/s',
      code: '2A',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'circularFrequency',
        'pulsatance',
        'cyclotronAngularFrequency',
        'angularVelocity',
        'debyeAngularFrequency',
        'angularFrequency',
        'nuclearPrecession'
      ]
    },
    radianPerSecondSquared: {
      name: 'radianPerSecondSquared',
      label: 'radian per second squared',
      symbol: 'rad/s²',
      code: '2B',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['angularAcceleration']
    },
    radianSquareMetrePerKilogram: {
      name: 'radianSquareMetrePerKilogram',
      label: 'radian square metre per kilogram',
      symbol: 'rad·m²/kg',
      code: 'C83',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificOpticalRotatoryPower', 'rotatoryPower', 'massicOptical']
    },
    radianSquareMetrePerMole: {
      name: 'radianSquareMetrePerMole',
      label: 'radian square metre per mole',
      symbol: 'rad·m²/mol',
      code: 'C82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['molarOpticalRotatoryPower']
    },
    rate: {
      name: 'rate',
      label: 'rate',
      symbol: null,
      code: 'A9',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    ration: {
      name: 'ration',
      label: 'ration',
      symbol: null,
      code: '13',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    ream: {
      name: 'ream',
      label: 'ream',
      symbol: null,
      code: 'RM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    reciprocalAngstrom: {
      name: 'reciprocalAngstrom',
      label: 'reciprocal angstrom',
      symbol: 'Å⁻¹',
      code: 'C85',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalMetre'];
      },
      conversionFactor: '10¹⁰ m⁻¹',
      quantityKinds: [
        'fermiAngularRepetency',
        'fermiAngularWaveNumber',
        'repetency',
        'curvature',
        'totalIonizationByAParticle',
        'macroscopicTotalCrossSection',
        'wavenumber',
        'phaseCoefficient',
        'waveNumber',
        'volumicCrossSection',
        'rydbergConstant',
        'linearIonizationByAParticle',
        'attenuationCoefficient',
        'lensPower',
        'vergence',
        'linearAttenuationCoefficient',
        'angularReciprocalLatticeVector',
        'propagationCoefficient',
        'angularWaveNumber',
        'linearExtinctionCoefficient',
        'fundamentalReciprocalLatticeVector',
        'angularRepetency',
        'volumicTotalCrossSection',
        'macroscopicCrossSection',
        'linearAbsorptionCoefficient'
      ]
    },
    reciprocalBar: {
      name: 'reciprocalBar',
      label: 'reciprocal bar',
      symbol: '1/bar',
      code: 'F58',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['compressibility', 'bulkCompressibility']
    },
    reciprocalCentimetre: {
      name: 'reciprocalCentimetre',
      label: 'reciprocal centimetre',
      symbol: 'cm⁻¹',
      code: 'E90',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalMetre'];
      },
      conversionFactor: '10² m⁻¹',
      quantityKinds: [
        'repetency',
        'curvature',
        'totalIonizationByAParticle',
        'macroscopicTotalCrossSection',
        'wavenumber',
        'phaseCoefficient',
        'waveNumber',
        'volumicCrossSection',
        'rydbergConstant',
        'linearIonizationByAParticle',
        'attenuationCoefficient',
        'lensPower',
        'vergence',
        'linearAttenuationCoefficient',
        'angularReciprocalLatticeVector',
        'propagationCoefficient',
        'angularWaveNumber',
        'linearExtinctionCoefficient',
        'fundamentalReciprocalLatticeVector',
        'angularRepetency',
        'volumicTotalCrossSection',
        'macroscopicCrossSection',
        'linearAbsorptionCoefficient'
      ]
    },
    reciprocalCubicCentimetre: {
      name: 'reciprocalCubicCentimetre',
      label: 'reciprocal cubic centimetre',
      symbol: 'cm⁻³',
      code: 'H50',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalCubicMetre'];
      },
      conversionFactor: '10⁶ m⁻³',
      quantityKinds: [
        'numberDensityOfMoleculesOrParticles',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'volumicAcceptorNumber',
        'ionDensity',
        'volumicDonorNumber',
        'electronNumberDensity',
        'neutronNumberDensity',
        'intrinsicNumberDensity',
        'donorNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'numberDensityOfMoleculesOrParticles',
        'volumicElectronNumber',
        'volumicHoleNumber',
        'volumicIntrinsisNumber',
        'acceptorNumberDensity',
        'ionNumberDensity',
        'holeNumberDensity'
      ]
    },
    reciprocalCubicFoot: {
      name: 'reciprocalCubicFoot',
      label: 'reciprocal cubic foot',
      symbol: '1/ft³',
      code: 'K20',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalCubicMetre'];
      },
      conversionFactor: '35.31466 m⁻³',
      quantityKinds: [
        'volumicAcceptorNumber',
        'ionDensity',
        'volumicDonorNumber',
        'electronNumberDensity',
        'neutronNumberDensity',
        'intrinsicNumberDensity',
        'donorNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'numberDensityOfMoleculesOrParticles',
        'volumicElectronNumber',
        'volumicHoleNumber',
        'volumicIntrinsisNumber',
        'acceptorNumberDensity',
        'ionNumberDensity',
        'holeNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'numberDensityOfMoleculesOrParticles',
        'molecularConcentrationOfB'
      ]
    },
    reciprocalCubicInch: {
      name: 'reciprocalCubicInch',
      label: 'reciprocal cubic inch',
      symbol: '1/in³',
      code: 'K49',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalCubicMetre'];
      },
      conversionFactor: '6.1023759 × 10⁴ m⁻³',
      quantityKinds: [
        'numberDensityOfMoleculesOrParticles',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'volumicAcceptorNumber',
        'ionDensity',
        'volumicDonorNumber',
        'electronNumberDensity',
        'neutronNumberDensity',
        'intrinsicNumberDensity',
        'donorNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'numberDensityOfMoleculesOrParticles',
        'volumicElectronNumber',
        'volumicHoleNumber',
        'volumicIntrinsisNumber',
        'acceptorNumberDensity',
        'ionNumberDensity',
        'holeNumberDensity'
      ]
    },
    reciprocalCubicMetre: {
      name: 'reciprocalCubicMetre',
      label: 'reciprocal cubic metre',
      symbol: 'm⁻³',
      code: 'C86',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'volumicAcceptorNumber',
        'ionDensity',
        'volumicDonorNumber',
        'electronNumberDensity',
        'neutronNumberDensity',
        'intrinsicNumberDensity',
        'donorNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'numberDensityOfMoleculesOrParticles',
        'volumicElectronNumber',
        'volumicHoleNumber',
        'volumicIntrinsisNumber',
        'acceptorNumberDensity',
        'ionNumberDensity',
        'holeNumberDensity'
      ]
    },
    reciprocalCubicMetrePerSecond: {
      name: 'reciprocalCubicMetrePerSecond',
      label: 'reciprocal cubic metre per second',
      symbol: 'm⁻³/s',
      code: 'C87',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['slowingDownDensity']
    },
    reciprocalCubicMillimetre: {
      name: 'reciprocalCubicMillimetre',
      label: 'reciprocal cubic millimetre',
      symbol: '1/mm³',
      code: 'L20',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalCubicMetre'];
      },
      conversionFactor: '10⁹ m⁻³',
      quantityKinds: [
        'numberDensityOfMoleculesOrParticles',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'volumicAcceptorNumber',
        'ionDensity',
        'volumicDonorNumber',
        'electronNumberDensity',
        'neutronNumberDensity',
        'intrinsicNumberDensity',
        'donorNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'numberDensityOfMoleculesOrParticles',
        'volumicElectronNumber',
        'volumicHoleNumber',
        'volumicIntrinsisNumber',
        'acceptorNumberDensity',
        'ionNumberDensity',
        'holeNumberDensity'
      ]
    },
    reciprocalCubicYard: {
      name: 'reciprocalCubicYard',
      label: 'reciprocal cubic yard',
      symbol: '1/yd³',
      code: 'M10',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalCubicMetre'];
      },
      conversionFactor: '1.307951 m⁻³',
      quantityKinds: [
        'volumicAcceptorNumber',
        'ionDensity',
        'volumicDonorNumber',
        'electronNumberDensity',
        'neutronNumberDensity',
        'intrinsicNumberDensity',
        'donorNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'numberDensityOfMoleculesOrParticles',
        'volumicElectronNumber',
        'volumicHoleNumber',
        'volumicIntrinsisNumber',
        'acceptorNumberDensity',
        'ionNumberDensity',
        'holeNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'numberDensityOfMoleculesOrParticles'
      ]
    },
    reciprocalDay: {
      name: 'reciprocalDay',
      label: 'reciprocal day',
      symbol: 'd⁻¹',
      code: 'E91',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalSecond'];
      },
      conversionFactor: '1.15741 × 10⁻⁵ s⁻¹',
      quantityKinds: [
        'rotationalFrequency',
        'pulsatance',
        'larmorAngularFrequency',
        'angularFrequency',
        'circularFrequency',
        'decayConstant',
        'disintegrationConstant',
        'dampingCoefficient',
        'photonFlux',
        'debyeAngularFrequency'
      ]
    },
    reciprocalDegreeFahrenheit: {
      name: 'reciprocalDegreeFahrenheit',
      label: 'reciprocal degree Fahrenheit',
      symbol: '1/°F',
      code: 'J26',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['temperature']
    },
    reciprocalElectronVoltPerCubicMetre: {
      name: 'reciprocalElectronVoltPerCubicMetre',
      label: 'reciprocal electron volt per cubic metre',
      symbol: 'eV⁻¹/m³',
      code: 'C88',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalJoulePerCubicMetre'];
      },
      conversionFactor: '6.24146 × 10¹⁸ J⁻¹/m³',
      quantityKinds: ['densityOfStates', 'densityOfStates']
    },
    reciprocalHenry: {
      name: 'reciprocalHenry',
      label: 'reciprocal henry',
      symbol: 'H⁻¹',
      code: 'C89',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['reluctance']
    },
    reciprocalHour: {
      name: 'reciprocalHour',
      label: 'reciprocal hour',
      symbol: '1/h',
      code: 'H10',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ s⁻¹',
      quantityKinds: [
        'frequency',
        'rotationalFrequency',
        'pulsatance',
        'larmorAngularFrequency',
        'angularFrequency',
        'circularFrequency',
        'decayConstant',
        'disintegrationConstant',
        'dampingCoefficient',
        'photonFlux',
        'debyeAngularFrequency'
      ]
    },
    reciprocalInch: {
      name: 'reciprocalInch',
      label: 'reciprocal inch',
      symbol: '1/in',
      code: 'Q24',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalMetre'];
      },
      conversionFactor: '39.37008 m⁻¹',
      quantityKinds: [
        'repetency',
        'curvature',
        'totalIonizationByAParticle',
        'macroscopicTotalCrossSection',
        'wavenumber',
        'phaseCoefficient',
        'waveNumber',
        'volumicCrossSection',
        'rydbergConstant',
        'linearIonizationByAParticle',
        'attenuationCoefficient',
        'lensPower',
        'vergence',
        'linearAttenuationCoefficient',
        'angularReciprocalLatticeVector',
        'propagationCoefficient',
        'angularWaveNumber',
        'linearExtinctionCoefficient',
        'fundamentalReciprocalLatticeVector',
        'angularRepetency',
        'volumicTotalCrossSection',
        'macroscopicCrossSection',
        'linearAbsorptionCoefficient'
      ]
    },
    reciprocalJoule: {
      name: 'reciprocalJoule',
      label: 'reciprocal joule',
      symbol: '1/J',
      code: 'N91',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['performanceCharacteristic', 'coefficient']
    },
    reciprocalJoulePerCubicMetre: {
      name: 'reciprocalJoulePerCubicMetre',
      label: 'reciprocal joule per cubic metre',
      symbol: 'J⁻¹/m³',
      code: 'C90',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['densityOfStates']
    },
    reciprocalKelvinOrKelvinToThePowerMinusOne: {
      name: 'reciprocalKelvinOrKelvinToThePowerMinusOne',
      label: 'reciprocal kelvin or kelvin to the power minus one',
      symbol: 'K⁻¹',
      code: 'C91',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['relativePressureCoefficient', 'linearExpansionCoefficient', 'cubicExpansionCoefficient']
    },
    reciprocalKilovoltAmpereReciprocalHour: {
      name: 'reciprocalKilovoltAmpereReciprocalHour',
      label: 'reciprocal kilovolt - ampere reciprocal hour',
      symbol: '1/kVAh',
      code: 'M21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['performanceCharacteristic', 'coefficient']
    },
    reciprocalLitre: {
      name: 'reciprocalLitre',
      label: 'reciprocal litre',
      symbol: '1/l',
      code: 'K63',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalCubicMetre'];
      },
      conversionFactor: '10³ m⁻³',
      quantityKinds: [
        'volumicAcceptorNumber',
        'ionDensity',
        'volumicDonorNumber',
        'electronNumberDensity',
        'neutronNumberDensity',
        'intrinsicNumberDensity',
        'donorNumberDensity',
        'volumicNumberOfMoleculesOrParticles',
        'molecularConcentrationOfB',
        'numberDensityOfMoleculesOrParticles',
        'volumicElectronNumber',
        'volumicHoleNumber',
        'volumicIntrinsisNumber',
        'acceptorNumberDensity',
        'ionNumberDensity',
        'holeNumberDensity',
        'molecularConcentrationOfB',
        'volumicNumberOfMoleculesOrParticles',
        'numberDensityOfMoleculesOrParticles'
      ]
    },
    reciprocalMegakelvinOrMegakelvinToThePowerMinusOne: {
      name: 'reciprocalMegakelvinOrMegakelvinToThePowerMinusOne',
      label: 'reciprocal megakelvin or megakelvin to the power minus one',
      symbol: '1/MK',
      code: 'M20',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalKelvinOrKelvinToThePowerMinusOne'];
      },
      conversionFactor: '10⁻⁶ K⁻¹',
      quantityKinds: [
        'relativePressureCoefficient',
        'linearExpansionCoefficient',
        'cubicExpansionCoefficient',
        'cubicExpansionCoefficient',
        'linearExpansionCoefficient',
        'relativePressureCoefficient'
      ]
    },
    reciprocalMetre: {
      name: 'reciprocalMetre',
      label: 'reciprocal metre',
      symbol: 'm⁻¹',
      code: 'C92',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'repetency',
        'curvature',
        'totalIonizationByAParticle',
        'macroscopicTotalCrossSection',
        'wavenumber',
        'phaseCoefficient',
        'waveNumber',
        'volumicCrossSection',
        'rydbergConstant',
        'linearIonizationByAParticle',
        'attenuationCoefficient',
        'lensPower',
        'vergence',
        'linearAttenuationCoefficient',
        'angularReciprocalLatticeVector',
        'propagationCoefficient',
        'angularWaveNumber',
        'linearExtinctionCoefficient',
        'fundamentalReciprocalLatticeVector',
        'angularRepetency',
        'volumicTotalCrossSection',
        'macroscopicCrossSection',
        'linearAbsorptionCoefficient'
      ]
    },
    reciprocalMetreSquaredReciprocalSecond: {
      name: 'reciprocalMetreSquaredReciprocalSecond',
      label: 'reciprocal metre squared reciprocal second',
      symbol: 'm⁻²/s',
      code: 'B81',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['particleFluenceRate', 'currentDensityOfParticles', 'neutronfluxDensity', 'particalFluxDensity', 'neutronFluenceRate']
    },
    reciprocalMinute: {
      name: 'reciprocalMinute',
      label: 'reciprocal minute',
      symbol: 'min⁻¹',
      code: 'C94',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '1.666667 × 10⁻² s',
      quantityKinds: [
        'rotationalFrequency',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    reciprocalMole: {
      name: 'reciprocalMole',
      label: 'reciprocal mole',
      symbol: 'mol⁻¹',
      code: 'C95',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['avogadroConstant']
    },
    reciprocalMonth: {
      name: 'reciprocalMonth',
      label: 'reciprocal month',
      symbol: '1/mo',
      code: 'H11',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalSecond'];
      },
      conversionFactor: '3.80257 × 10⁻⁷ s⁻¹',
      quantityKinds: [
        'rotationalFrequency',
        'pulsatance',
        'larmorAngularFrequency',
        'angularFrequency',
        'circularFrequency',
        'decayConstant',
        'disintegrationConstant',
        'dampingCoefficient',
        'photonFlux',
        'debyeAngularFrequency',
        'frequency'
      ]
    },
    reciprocalPascalOrPascalToThePowerMinusOne: {
      name: 'reciprocalPascalOrPascalToThePowerMinusOne',
      label: 'reciprocal pascal or pascal to the power minus one',
      symbol: 'Pa⁻¹',
      code: 'C96',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['isothermalCompressibility', 'compressibility', 'bulkCompressibility', 'isentropicCompressibility']
    },
    reciprocalPsi: {
      name: 'reciprocalPsi',
      label: 'reciprocal psi',
      symbol: '1/psi',
      code: 'K93',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalPascalOrPascalToThePowerMinusOne'];
      },
      conversionFactor: '1.450377 × 10⁻⁴ Pa⁻¹',
      quantityKinds: [
        'isothermalCompressibility',
        'compressibility',
        'bulkCompressibility',
        'isentropicCompressibility',
        'amountOfSubstance',
        'massDensity',
        'density',
        'volumicMass',
        'massConcentrationOfB',
        'concentrationOfB'
      ]
    },
    reciprocalRadian: {
      name: 'reciprocalRadian',
      label: 'reciprocal radian',
      symbol: '1/rad',
      code: 'P97',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    reciprocalSecond: {
      name: 'reciprocalSecond',
      label: 'reciprocal second',
      symbol: 's⁻¹',
      code: 'C97',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'rotationalFrequency',
        'pulsatance',
        'larmorAngularFrequency',
        'angularFrequency',
        'circularFrequency',
        'decayConstant',
        'disintegrationConstant',
        'dampingCoefficient',
        'photonFlux',
        'debyeAngularFrequency'
      ]
    },
    reciprocalSecondPerMetreSquared: {
      name: 'reciprocalSecondPerMetreSquared',
      label: 'reciprocal second per metre squared',
      symbol: 's⁻¹/m²',
      code: 'C99',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['photonExitance', 'irradiance']
    },
    reciprocalSecondPerSteradian: {
      name: 'reciprocalSecondPerSteradian',
      label: 'reciprocal second per steradian',
      symbol: 's⁻¹/sr',
      code: 'D1',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['photonIntensity']
    },
    reciprocalSecondPerSteradianMetreSquared: {
      name: 'reciprocalSecondPerSteradianMetreSquared',
      label: 'reciprocal second per steradian metre squared',
      symbol: 's⁻¹/(sr·m²)',
      code: 'D2',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['photonRadiance', 'photonLuminance']
    },
    reciprocalSquareInch: {
      name: 'reciprocalSquareInch',
      label: 'reciprocal square inch',
      symbol: '1/in²',
      code: 'P78',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalSquareMetre'];
      },
      conversionFactor: '1.550003 × 10³ m⁻²',
      quantityKinds: ['photonExposure', 'particleFluence', 'particleFluence']
    },
    reciprocalSquareMetre: {
      name: 'reciprocalSquareMetre',
      label: 'reciprocal square metre',
      symbol: 'm⁻²',
      code: 'C93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['photonExposure', 'particleFluence']
    },
    reciprocalVolt: {
      name: 'reciprocalVolt',
      label: 'reciprocal volt',
      symbol: '1/V',
      code: 'P96',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    reciprocalVoltAmpereReciprocalSecond: {
      name: 'reciprocalVoltAmpereReciprocalSecond',
      label: 'reciprocal volt - ampere reciprocal second',
      symbol: '1/(V·A·s)',
      code: 'M30',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['performanceCharacteristic', 'coefficient']
    },
    reciprocalWeek: {
      name: 'reciprocalWeek',
      label: 'reciprocal week',
      symbol: '1/wk',
      code: 'H85',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalSecond'];
      },
      conversionFactor: '1.647989452868 × 10⁻⁶ s⁻¹',
      quantityKinds: [
        'frequency',
        'rotationalFrequency',
        'pulsatance',
        'larmorAngularFrequency',
        'angularFrequency',
        'circularFrequency',
        'decayConstant',
        'disintegrationConstant',
        'dampingCoefficient',
        'photonFlux',
        'debyeAngularFrequency'
      ]
    },
    reciprocalYear: {
      name: 'reciprocalYear',
      label: 'reciprocal year',
      symbol: '1/y',
      code: 'H09',
      referenceUnit: function () {
        return sammUDefinition.units['reciprocalSecond'];
      },
      conversionFactor: '3.16881 × 10⁻⁸ s⁻¹',
      quantityKinds: [
        'rotationalFrequency',
        'pulsatance',
        'larmorAngularFrequency',
        'angularFrequency',
        'circularFrequency',
        'decayConstant',
        'disintegrationConstant',
        'dampingCoefficient',
        'photonFlux',
        'debyeAngularFrequency',
        'frequency'
      ]
    },
    rem: {
      name: 'rem',
      label: 'rem',
      symbol: 'rem',
      code: 'D91',
      referenceUnit: function () {
        return sammUDefinition.units['sievert'];
      },
      conversionFactor: '10⁻² Sv',
      quantityKinds: ['doseEquivalent', 'doseEquivalent']
    },
    remPerSecond: {
      name: 'remPerSecond',
      label: 'rem per second',
      symbol: 'rem/s',
      code: 'P69',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '10⁻² Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    revenueTonMile: {
      name: 'revenueTonMile',
      label: 'revenue ton mile',
      symbol: null,
      code: 'RT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    revolution: {
      name: 'revolution',
      label: 'revolution',
      symbol: 'rev',
      code: 'M44',
      referenceUnit: function () {
        return sammUDefinition.units['rad'];
      },
      conversionFactor: '6.283185 rad',
      quantityKinds: ['absorbedDose', 'anglePlane']
    },
    revolutionPerMinute: {
      name: 'revolutionPerMinute',
      label: 'revolution per minute',
      symbol: 'r/min',
      code: 'M46',
      referenceUnit: function () {
        return sammUDefinition.units['radianPerSecond'];
      },
      conversionFactor: '0.1047198 rad/s',
      quantityKinds: [
        'angularVelocity',
        'circularFrequency',
        'pulsatance',
        'cyclotronAngularFrequency',
        'angularVelocity',
        'debyeAngularFrequency',
        'angularFrequency',
        'nuclearPrecession'
      ]
    },
    revolutionsPerMinute: {
      name: 'revolutionsPerMinute',
      label: 'revolutions per minute',
      symbol: 'r/min',
      code: 'RPM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['rotationalFrequency']
    },
    revolutionsPerSecond: {
      name: 'revolutionsPerSecond',
      label: 'revolutions per second',
      symbol: 'r/s',
      code: 'RPS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['rotationalFrequency']
    },
    rhe: {
      name: 'rhe',
      label: 'rhe',
      symbol: 'rhe',
      code: 'P88',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    rodUnitOfDistance: {
      name: 'rodUnitOfDistance',
      label: 'rod [unit of distance]',
      symbol: 'rd (US)',
      code: 'F49',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '5.029210 m',
      quantityKinds: [
        'diameter',
        'lengthOfPath',
        'radius',
        'cartesianCoordinates',
        'breadth',
        'length',
        'radiusOfCurvature',
        'distance',
        'height',
        'thickness',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    roentgen: {
      name: 'roentgen',
      label: 'roentgen',
      symbol: 'R',
      code: '2C',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerKilogram'];
      },
      conversionFactor: '2.58 × 10⁻⁴ C/kg',
      quantityKinds: ['exposure', 'exposure']
    },
    roentgenPerSecond: {
      name: 'roentgenPerSecond',
      label: 'roentgen per second',
      symbol: 'R/s',
      code: 'D6',
      referenceUnit: function () {
        return sammUDefinition.units['coulombPerKilogramSecond'];
      },
      conversionFactor: '2.58 × 10⁻⁴ C/(kg × s)',
      quantityKinds: ['exposureRate', 'exposureRate']
    },
    room: {
      name: 'room',
      label: 'room',
      symbol: null,
      code: 'ROM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    round: {
      name: 'round',
      label: 'round',
      symbol: null,
      code: 'D65',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    runFoot: {
      name: 'runFoot',
      label: 'run foot',
      symbol: null,
      code: 'E52',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    runningOrOperatingHour: {
      name: 'runningOrOperatingHour',
      label: 'running or operating hour',
      symbol: null,
      code: 'RH',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    score: {
      name: 'score',
      label: 'score',
      symbol: null,
      code: 'SCO',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    scruple: {
      name: 'scruple',
      label: 'scruple',
      symbol: null,
      code: 'SCR',
      referenceUnit: function () {
        return sammUDefinition.units['gram'];
      },
      conversionFactor: '1.295982 g',
      quantityKinds: ['mass']
    },
    secondPerCubicMetre: {
      name: 'secondPerCubicMetre',
      label: 'second per cubic metre',
      symbol: 's/m³',
      code: 'D93',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicDose']
    },
    secondPerCubicMetreRadian: {
      name: 'secondPerCubicMetreRadian',
      label: 'second per cubic metre radian',
      symbol: 's/(rad·m³)',
      code: 'D94',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['spectralConcentrationOfVibrationalModesInTermsOfAngularFrequency']
    },
    secondPerKilogramm: {
      name: 'secondPerKilogramm',
      label: 'second per kilogramm',
      symbol: 's/kg',
      code: 'Q20',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    secondPerRadianCubicMetre: {
      name: 'secondPerRadianCubicMetre',
      label: 'second per radian cubic metre',
      symbol: '1/(Hz·rad·m³)',
      code: 'Q22',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    secondUnitOfAngle: {
      name: 'secondUnitOfAngle',
      label: 'second [unit of angle]',
      symbol: '"',
      code: 'D62',
      referenceUnit: function () {
        return sammUDefinition.units['rad'];
      },
      conversionFactor: '4.848137 × 10⁻⁶ rad',
      quantityKinds: ['anglePlane', 'absorbedDose']
    },
    secondUnitOfTime: {
      name: 'secondUnitOfTime',
      label: 'second [unit of time]',
      symbol: 's',
      code: 'SEC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    segment: {
      name: 'segment',
      label: 'segment',
      symbol: null,
      code: 'SG',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    serviceUnit: {
      name: 'serviceUnit',
      label: 'service unit',
      symbol: null,
      code: 'E48',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    set: {
      name: 'set',
      label: 'set',
      symbol: null,
      code: 'SET',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    shake: {
      name: 'shake',
      label: 'shake',
      symbol: 'shake',
      code: 'M56',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '10⁻⁸ s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    shannon: {
      name: 'shannon',
      label: 'shannon',
      symbol: 'Sh',
      code: 'Q14',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    shannonPerSecond: {
      name: 'shannonPerSecond',
      label: 'shannon per second',
      symbol: 'Sh/s',
      code: 'Q17',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    shares: {
      name: 'shares',
      label: 'shares',
      symbol: null,
      code: 'E21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    shipment: {
      name: 'shipment',
      label: 'shipment',
      symbol: null,
      code: 'SX',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    shot: {
      name: 'shot',
      label: 'shot',
      symbol: null,
      code: '14',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    siderealYear: {
      name: 'siderealYear',
      label: 'sidereal year',
      symbol: 'y (sidereal)',
      code: 'L96',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '3.155815 × 10⁷ s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    siemens: {
      name: 'siemens',
      label: 'siemens',
      symbol: 'S',
      code: 'SIE',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'admittance',
        'modulusOfAdmittance',
        'conductanceForAlternatingCurrent',
        'conductanceForDirectCurrent',
        'complexAdmittance'
      ]
    },
    siemensPerCentimetre: {
      name: 'siemensPerCentimetre',
      label: 'siemens per centimetre',
      symbol: 'S/cm',
      code: 'H43',
      referenceUnit: function () {
        return sammUDefinition.units['siemensPerMetre'];
      },
      conversionFactor: '10² S/m',
      quantityKinds: ['electrolyticConductivity', 'conductivity', 'conductivity']
    },
    siemensPerMetre: {
      name: 'siemensPerMetre',
      label: 'siemens per metre',
      symbol: 'S/m',
      code: 'D10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electrolyticConductivity', 'conductivity']
    },
    siemensSquareMetrePerMole: {
      name: 'siemensSquareMetrePerMole',
      label: 'siemens square metre per mole',
      symbol: 'S·m²/mol',
      code: 'D12',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['molarConductivity']
    },
    sievert: {
      name: 'sievert',
      label: 'sievert',
      symbol: 'Sv',
      code: 'D13',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['doseEquivalent']
    },
    sievertPerHour: {
      name: 'sievertPerHour',
      label: 'sievert per hour',
      symbol: 'Sv/h',
      code: 'P70',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻⁴ Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    sievertPerMinute: {
      name: 'sievertPerMinute',
      label: 'sievert per minute',
      symbol: 'Sv/min',
      code: 'P74',
      referenceUnit: function () {
        return sammUDefinition.units['sievertPerSecond'];
      },
      conversionFactor: '0.016666 Sv/s',
      quantityKinds: ['equivalenceDoseOutput', 'equivalenceDoseOutput']
    },
    sievertPerSecond: {
      name: 'sievertPerSecond',
      label: 'sievert per second',
      symbol: 'Sv/s',
      code: 'P65',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['equivalenceDoseOutput']
    },
    sitas: {
      name: 'sitas',
      label: 'sitas',
      symbol: null,
      code: '56',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    skein: {
      name: 'skein',
      label: 'skein',
      symbol: null,
      code: 'SW',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    slug: {
      name: 'slug',
      label: 'slug',
      symbol: 'slug',
      code: 'F13',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '1.459390 × 10¹ kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    slugPerCubicFoot: {
      name: 'slugPerCubicFoot',
      label: 'slug per cubic foot',
      symbol: 'slug/ft³',
      code: 'L65',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '5.153788 × 10² kg/m³',
      quantityKinds: [
        'massDensity',
        'volumicMass',
        'density',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    slugPerDay: {
      name: 'slugPerDay',
      label: 'slug per day',
      symbol: 'slug/d',
      code: 'L63',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '1.689109 × 10⁻⁴ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    slugPerFootSecond: {
      name: 'slugPerFootSecond',
      label: 'slug per foot second',
      symbol: 'slug/(ft·s)',
      code: 'L64',
      referenceUnit: function () {
        return sammUDefinition.units['pascalSecond'];
      },
      conversionFactor: '47.88026 Pa × s',
      quantityKinds: ['viscosityDynamicViscosity', 'viscosityDynamicViscosity']
    },
    slugPerHour: {
      name: 'slugPerHour',
      label: 'slug per hour',
      symbol: 'slug/h',
      code: 'L66',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '4.053861 × 10⁻³ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    slugPerMinute: {
      name: 'slugPerMinute',
      label: 'slug per minute',
      symbol: 'slug/min',
      code: 'L67',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '0.2432317 kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    slugPerSecond: {
      name: 'slugPerSecond',
      label: 'slug per second',
      symbol: 'slug/s',
      code: 'L68',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '14.59390 kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    sone: {
      name: 'sone',
      label: 'sone',
      symbol: null,
      code: 'D15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['loudness']
    },
    square: {
      name: 'square',
      label: 'square',
      symbol: null,
      code: 'SQ',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    squareCentimetre: {
      name: 'squareCentimetre',
      label: 'square centimetre',
      symbol: 'cm²',
      code: 'CMK',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10⁻⁴ m²',
      quantityKinds: [
        'area',
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection'
      ]
    },
    squareCentimetrePerErg: {
      name: 'squareCentimetrePerErg',
      label: 'square centimetre per erg',
      symbol: 'cm²/erg',
      code: 'D16',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerJoule'];
      },
      conversionFactor: '10³ m²/J',
      quantityKinds: ['spectralCrossSection', 'spectralCrossSection']
    },
    squareCentimetrePerGram: {
      name: 'squareCentimetrePerGram',
      label: 'square centimetre per gram',
      symbol: 'cm²/g',
      code: 'H15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['specificVolume', 'massicVolume']
    },
    squareCentimetrePerSecond: {
      name: 'squareCentimetrePerSecond',
      label: 'square centimetre per second',
      symbol: 'cm²/s',
      code: 'M81',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerSecond'];
      },
      conversionFactor: '10⁻⁴ m²/s',
      quantityKinds: [
        'kinematicViscosity',
        'diffusionCoefficient',
        'thermalDiffusionCoefficient',
        'kinematicViscosity',
        'diffusionCoefficientForNeutronNumberDensity',
        'thermalDiffusivity'
      ]
    },
    squareCentimetrePerSteradianErg: {
      name: 'squareCentimetrePerSteradianErg',
      label: 'square centimetre per steradian erg',
      symbol: 'cm²/(sr·erg)',
      code: 'D17',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerSteradianJoule'];
      },
      conversionFactor: '10³ m²/(sr × J)',
      quantityKinds: ['spectralAngularCrossSection', 'spectralAngularCrossSection']
    },
    squareDecametre: {
      name: 'squareDecametre',
      label: 'square decametre',
      symbol: 'dam²',
      code: 'H16',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10² m²',
      quantityKinds: [
        'area',
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection'
      ]
    },
    squareDecimetre: {
      name: 'squareDecimetre',
      label: 'square decimetre',
      symbol: 'dm²',
      code: 'DMK',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10⁻² m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    squareFoot: {
      name: 'squareFoot',
      label: 'square foot',
      symbol: 'ft²',
      code: 'FTK',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '9.290304 × 10⁻² m²',
      quantityKinds: [
        'area',
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection'
      ]
    },
    squareFootPerHour: {
      name: 'squareFootPerHour',
      label: 'square foot per hour',
      symbol: 'ft²/h',
      code: 'M79',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerSecond'];
      },
      conversionFactor: '2.58064 × 10⁻⁵ m²/s',
      quantityKinds: [
        'kinematicViscosity',
        'diffusionCoefficient',
        'thermalDiffusionCoefficient',
        'kinematicViscosity',
        'diffusionCoefficientForNeutronNumberDensity',
        'thermalDiffusivity'
      ]
    },
    squareFootPerSecond: {
      name: 'squareFootPerSecond',
      label: 'square foot per second',
      symbol: 'ft²/s',
      code: 'S3',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerSecond'];
      },
      conversionFactor: '0.09290304 m²/s',
      quantityKinds: [
        'kinematicViscosity',
        'thermalDiffusivity',
        'diffusionCoefficient',
        'thermalDiffusionCoefficient',
        'kinematicViscosity',
        'diffusionCoefficientForNeutronNumberDensity',
        'thermalDiffusivity'
      ]
    },
    squareHectometre: {
      name: 'squareHectometre',
      label: 'square hectometre',
      symbol: 'hm²',
      code: 'H18',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10⁴ m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    squareInch: {
      name: 'squareInch',
      label: 'square inch',
      symbol: 'in²',
      code: 'INK',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '6.4516 × 10⁻⁴ m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    squareInchPerSecond: {
      name: 'squareInchPerSecond',
      label: 'square inch per second',
      symbol: 'in²/s',
      code: 'G08',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['kinematicViscosity']
    },
    squareKilometre: {
      name: 'squareKilometre',
      label: 'square kilometre',
      symbol: 'km²',
      code: 'KMK',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10⁶ m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    squareMetre: {
      name: 'squareMetre',
      label: 'square metre',
      symbol: 'm²',
      code: 'MTK',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection'
      ]
    },
    squareMetreHourDegreeCelsiusPerKilocalorieInternationalTable: {
      name: 'squareMetreHourDegreeCelsiusPerKilocalorieInternationalTable',
      label: 'square metre hour degree Celsius per kilocalorie (international table)',
      symbol: 'm²·h·°C/kcal',
      code: 'L14',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['thermalInsulance', 'coefficientOfThermalInsulation']
    },
    squareMetreKelvinPerWatt: {
      name: 'squareMetreKelvinPerWatt',
      label: 'square metre kelvin per watt',
      symbol: 'm²·K/W',
      code: 'D19',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['thermalInsulance', 'coefficientOfThermalInsulation']
    },
    squareMetrePerJoule: {
      name: 'squareMetrePerJoule',
      label: 'square metre per joule',
      symbol: 'm²/J',
      code: 'D20',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['spectralCrossSection']
    },
    squareMetrePerKilogram: {
      name: 'squareMetrePerKilogram',
      label: 'square metre per kilogram',
      symbol: 'm²/kg',
      code: 'D21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massEnergyTransferCoefficient', 'massAttenuationCoefficient']
    },
    squareMetrePerLitre: {
      name: 'squareMetrePerLitre',
      label: 'square metre per litre',
      symbol: 'm²/l',
      code: 'E31',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    squareMetrePerMole: {
      name: 'squareMetrePerMole',
      label: 'square metre per mole',
      symbol: 'm²/mol',
      code: 'D22',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['molarAttenuationCoefficient', 'molarAbsorptionCoefficient']
    },
    squareMetrePerNewton: {
      name: 'squareMetrePerNewton',
      label: 'square metre per newton',
      symbol: 'm²/N',
      code: 'H59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['area']
    },
    squareMetrePerSecond: {
      name: 'squareMetrePerSecond',
      label: 'square metre per second',
      symbol: 'm²/s',
      code: 'S4',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'diffusionCoefficient',
        'thermalDiffusionCoefficient',
        'kinematicViscosity',
        'diffusionCoefficientForNeutronNumberDensity',
        'thermalDiffusivity'
      ]
    },
    squareMetrePerSecondBar: {
      name: 'squareMetrePerSecondBar',
      label: 'square metre per second bar',
      symbol: 'm²/(s·bar)',
      code: 'G41',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['kinematicViscosity']
    },
    squareMetrePerSecondKelvin: {
      name: 'squareMetrePerSecondKelvin',
      label: 'square metre per second kelvin',
      symbol: 'm²/(s·K)',
      code: 'G09',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['kinematicViscosity']
    },
    squareMetrePerSecondPascal: {
      name: 'squareMetrePerSecondPascal',
      label: 'square metre per second pascal',
      symbol: '(m²/s)/Pa',
      code: 'M82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['kinematicViscosity']
    },
    squareMetrePerSteradian: {
      name: 'squareMetrePerSteradian',
      label: 'square metre per steradian',
      symbol: 'm²/sr',
      code: 'D24',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['angularCrossSection']
    },
    squareMetrePerSteradianJoule: {
      name: 'squareMetrePerSteradianJoule',
      label: 'square metre per steradian joule',
      symbol: 'm²/(sr·J)',
      code: 'D25',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['spectralAngularCrossSection']
    },
    squareMetrePerVoltSecond: {
      name: 'squareMetrePerVoltSecond',
      label: 'square metre per volt second',
      symbol: 'm²/(V·s)',
      code: 'D26',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['mobility']
    },
    squareMicrometreSquareMicron: {
      name: 'squareMicrometreSquareMicron',
      label: 'square micrometre (square micron)',
      symbol: 'µm²',
      code: 'H30',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10⁻¹² m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    squareMileBasedOnUsSurveyFoot: {
      name: 'squareMileBasedOnUsSurveyFoot',
      label: 'square mile (based on U.S. survey foot)',
      symbol: 'mi² (US survey)',
      code: 'M48',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '2.589998 × 10⁶ m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    squareMileStatuteMile: {
      name: 'squareMileStatuteMile',
      label: 'square mile (statute mile)',
      symbol: 'mi²',
      code: 'MIK',
      referenceUnit: function () {
        return sammUDefinition.units['squareKilometre'];
      },
      conversionFactor: '2.589988 km²',
      quantityKinds: ['area', 'area']
    },
    squareMillimetre: {
      name: 'squareMillimetre',
      label: 'square millimetre',
      symbol: 'mm²',
      code: 'MMK',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '10⁻⁶ m²',
      quantityKinds: [
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection',
        'area'
      ]
    },
    squareRoofing: {
      name: 'squareRoofing',
      label: 'square, roofing',
      symbol: null,
      code: 'SQR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    squareYard: {
      name: 'squareYard',
      label: 'square yard',
      symbol: 'yd²',
      code: 'YDK',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetre'];
      },
      conversionFactor: '8.361274 × 10⁻¹ m²',
      quantityKinds: [
        'area',
        'diffusionArea',
        'slowingDownArea',
        'nuclearQuadrupoleMoment',
        'migrationArea',
        'equivalentAbsorptionAreaOfASurfaceOrObject',
        'atomicAttenuationCoefficient',
        'area',
        'crossSection'
      ]
    },
    standard: {
      name: 'standard',
      label: 'standard',
      symbol: 'std',
      code: 'WSD',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '4.672 m³',
      quantityKinds: ['volume', 'sectionModulus']
    },
    standardAccelerationOfFreeFall: {
      name: 'standardAccelerationOfFreeFall',
      label: 'standard acceleration of free fall',
      symbol: 'gn',
      code: 'K40',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '9.80665 m/s²',
      quantityKinds: [
        'accelerationDueToGravity',
        'acceleration',
        'accelerationOfFreeFall',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    standardAtmosphere: {
      name: 'standardAtmosphere',
      label: 'standard atmosphere',
      symbol: 'atm',
      code: 'ATM',
      referenceUnit: function () {
        return sammUDefinition.units['pascal'];
      },
      conversionFactor: '101325 Pa',
      quantityKinds: [
        'pressure',
        'bulkModulus',
        'shearStress',
        'normalStress',
        'fugacityOfBInAGaseousMixture',
        'osmoticPressure',
        'modulusOfRigidity',
        'shearModulus',
        'modulusOfCompression',
        'partialPressureOfBInAGaseousMixture',
        'staticPressure',
        'modulusOfElasticity',
        'instantaneousSoundPressure',
        'bulkModulus',
        'shearModulus',
        'modulusOfCompression',
        'shearStress',
        'normalStress',
        'modulusOfElasticity',
        'pressure',
        'modulusOfRigidity'
      ]
    },
    standardAtmospherePerMetre: {
      name: 'standardAtmospherePerMetre',
      label: 'standard atmosphere per metre',
      symbol: 'Atm/m',
      code: 'P83',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    standardKilolitre: {
      name: 'standardKilolitre',
      label: 'standard kilolitre',
      symbol: null,
      code: 'DMO',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    standardLitre: {
      name: 'standardLitre',
      label: 'standard litre',
      symbol: null,
      code: 'STL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    steradian: {
      name: 'steradian',
      label: 'steradian',
      symbol: 'sr',
      code: 'D27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['solidAngle']
    },
    stere: {
      name: 'stere',
      label: 'stere',
      symbol: 'st',
      code: 'G26',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: 'm³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    stick: {
      name: 'stick',
      label: 'stick',
      symbol: null,
      code: 'STC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    stickCigarette: {
      name: 'stickCigarette',
      label: 'stick, cigarette',
      symbol: null,
      code: 'STK',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    stickMilitary: {
      name: 'stickMilitary',
      label: 'stick, military',
      symbol: null,
      code: '15',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    stilb: {
      name: 'stilb',
      label: 'stilb',
      symbol: 'sb',
      code: 'P31',
      referenceUnit: function () {
        return sammUDefinition.units['candelaPerSquareMetre'];
      },
      conversionFactor: '10⁴ cd/m²',
      quantityKinds: ['luminance', 'luminance']
    },
    stokes: {
      name: 'stokes',
      label: 'stokes',
      symbol: 'St',
      code: '91',
      referenceUnit: function () {
        return sammUDefinition.units['squareMetrePerSecond'];
      },
      conversionFactor: '10⁻⁴ m²/s',
      quantityKinds: [
        'kinematicViscosity',
        'diffusionCoefficient',
        'thermalDiffusionCoefficient',
        'kinematicViscosity',
        'diffusionCoefficientForNeutronNumberDensity',
        'thermalDiffusivity'
      ]
    },
    stokesPerBar: {
      name: 'stokesPerBar',
      label: 'stokes per bar',
      symbol: 'St/bar',
      code: 'G46',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['kinematicViscosity']
    },
    stokesPerKelvin: {
      name: 'stokesPerKelvin',
      label: 'stokes per kelvin',
      symbol: 'St/K',
      code: 'G10',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['kinematicViscosity']
    },
    stokesPerPascal: {
      name: 'stokesPerPascal',
      label: 'stokes per pascal',
      symbol: 'St/Pa',
      code: 'M80',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['kinematicViscosity']
    },
    stoneUk: {
      name: 'stoneUk',
      label: 'stone (UK)',
      symbol: 'st',
      code: 'STI',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '6.350293 kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass', 'mass']
    },
    strand: {
      name: 'strand',
      label: 'strand',
      symbol: null,
      code: 'E30',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    straw: {
      name: 'straw',
      label: 'straw',
      symbol: null,
      code: 'STW',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    strip: {
      name: 'strip',
      label: 'strip',
      symbol: null,
      code: 'SR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    syringe: {
      name: 'syringe',
      label: 'syringe',
      symbol: null,
      code: 'SYR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tablespoonUs: {
      name: 'tablespoonUs',
      label: 'tablespoon (US)',
      symbol: 'tablespoon (US)',
      code: 'G24',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.478676 × 10⁻⁵ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    tablet: {
      name: 'tablet',
      label: 'tablet',
      symbol: null,
      code: 'U2',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    teaspoonUs: {
      name: 'teaspoonUs',
      label: 'teaspoon (US)',
      symbol: 'teaspoon (US)',
      code: 'G25',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '4.928922 × 10⁻⁶ m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    tebibitPerCubicMetre: {
      name: 'tebibitPerCubicMetre',
      label: 'tebibit per cubic metre',
      symbol: 'Tibit/m³',
      code: 'E86',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tebibitPerMetre: {
      name: 'tebibitPerMetre',
      label: 'tebibit per metre',
      symbol: 'Tibit/m',
      code: 'E85',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tebibitPerSquareMetre: {
      name: 'tebibitPerSquareMetre',
      label: 'tebibit per square metre',
      symbol: 'Tibit/m²',
      code: 'E87',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tebibyte: {
      name: 'tebibyte',
      label: 'Tebibyte',
      symbol: 'TiB',
      code: 'E61',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '2⁴⁰ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    technicalAtmospherePerMetre: {
      name: 'technicalAtmospherePerMetre',
      label: 'technical atmosphere per metre',
      symbol: 'at/m',
      code: 'P84',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    telecommunicationLineInService: {
      name: 'telecommunicationLineInService',
      label: 'telecommunication line in service',
      symbol: null,
      code: 'T0',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    telecommunicationLineInServiceAverage: {
      name: 'telecommunicationLineInServiceAverage',
      label: 'telecommunication line in service average',
      symbol: null,
      code: 'UB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    telecommunicationPort: {
      name: 'telecommunicationPort',
      label: 'telecommunication port',
      symbol: null,
      code: 'UC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tenDay: {
      name: 'tenDay',
      label: 'ten day',
      symbol: null,
      code: 'DAD',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tenPack: {
      name: 'tenPack',
      label: 'ten pack',
      symbol: null,
      code: 'TP',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tenPair: {
      name: 'tenPair',
      label: 'ten pair',
      symbol: null,
      code: 'TPR',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tenSet: {
      name: 'tenSet',
      label: 'ten set',
      symbol: null,
      code: 'TST',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tenThousandSticks: {
      name: 'tenThousandSticks',
      label: 'ten thousand sticks',
      symbol: null,
      code: 'TTS',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    terabit: {
      name: 'terabit',
      label: 'terabit',
      symbol: 'Tbit',
      code: 'E83',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    terabitPerSecond: {
      name: 'terabitPerSecond',
      label: 'terabit per second',
      symbol: 'Tbit/s',
      code: 'E84',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    terabyte: {
      name: 'terabyte',
      label: 'terabyte',
      symbol: 'TB',
      code: 'E35',
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '10¹² B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    terahertz: {
      name: 'terahertz',
      label: 'terahertz',
      symbol: 'THz',
      code: 'D29',
      referenceUnit: function () {
        return sammUDefinition.units['hertz'];
      },
      conversionFactor: '10¹² Hz',
      quantityKinds: ['frequency', 'frequency']
    },
    terajoule: {
      name: 'terajoule',
      label: 'terajoule',
      symbol: 'TJ',
      code: 'D30',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '10¹² J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'energy',
        'work',
        'potentialEnergy',
        'kineticEnergy'
      ]
    },
    teraohm: {
      name: 'teraohm',
      label: 'teraohm',
      symbol: 'TΩ',
      code: 'H44',
      referenceUnit: function () {
        return sammUDefinition.units['ohm'];
      },
      conversionFactor: '10¹² Ω',
      quantityKinds: [
        'modulusOfImpedance',
        'resistanceToAlternatingCurrent',
        'impedance',
        'complexImpedances',
        'resistanceToDirectCurrent',
        'reactance',
        'modulusOfImpedance',
        'reactance',
        'resistanceToAlternatingCurrent',
        'complexImpedances',
        'impedance',
        'resistanceToDirectCurrent'
      ]
    },
    terawatt: {
      name: 'terawatt',
      label: 'terawatt',
      symbol: 'TW',
      code: 'D31',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '10¹² W',
      quantityKinds: [
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower',
        'powerForDirectCurrent',
        'activePower'
      ]
    },
    terawattHour: {
      name: 'terawattHour',
      label: 'terawatt hour',
      symbol: 'TW·h',
      code: 'D32',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '3.6 × 10¹⁵ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'energy',
        'potentialEnergy',
        'kineticEnergy',
        'work'
      ]
    },
    tesla: {
      name: 'tesla',
      label: 'tesla',
      symbol: 'T',
      code: 'D33',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'magneticPolarization',
        'lowerCriticalMagneticFluxDensity',
        'magneticFluxDensity',
        'magneticInduction',
        'thermodynamicCriticalMagneticFluxDensity',
        'upperCriticalMagneticFluxDensity'
      ]
    },
    test: {
      name: 'test',
      label: 'test',
      symbol: null,
      code: 'E53',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    teu: {
      name: 'teu',
      label: 'TEU',
      symbol: null,
      code: 'E22',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tex: {
      name: 'tex',
      label: 'tex',
      symbol: 'tex (g/km)',
      code: 'D34',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerMetre'];
      },
      conversionFactor: '10⁻⁶ kg/m',
      quantityKinds: ['linearMass', 'linearDensity']
    },
    theoreticalPound: {
      name: 'theoreticalPound',
      label: 'theoretical pound',
      symbol: null,
      code: '24',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    theoreticalTon: {
      name: 'theoreticalTon',
      label: 'theoretical ton',
      symbol: null,
      code: '27',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    thermEc: {
      name: 'thermEc',
      label: 'therm (EC)',
      symbol: 'thm (EC)',
      code: 'N71',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.05506 × 10⁸ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'enthalpy',
        'thermodynamicEnergy',
        'quantityOfHeat',
        'heat',
        'helmholtzFreeEnergy',
        'energy',
        'helmholtzFunction'
      ]
    },
    thermUs: {
      name: 'thermUs',
      label: 'therm (U.S.)',
      symbol: 'thm (US)',
      code: 'N72',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '1.054804 × 10⁸ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'enthalpy',
        'thermodynamicEnergy',
        'helmholtzFunction',
        'quantityOfHeat',
        'heat',
        'helmholtzFreeEnergy',
        'energy'
      ]
    },
    thirtyDayMonth: {
      name: 'thirtyDayMonth',
      label: '30-day month',
      symbol: 'mo (30 days)',
      code: 'M36',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '2.592000 × 10⁶ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    thousand: {
      name: 'thousand',
      label: 'thousand',
      symbol: null,
      code: 'MIL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    thousandBoardFoot: {
      name: 'thousandBoardFoot',
      label: 'thousand board foot',
      symbol: null,
      code: 'MBF',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    thousandCubicFoot: {
      name: 'thousandCubicFoot',
      label: 'thousand cubic foot',
      symbol: 'kft³',
      code: 'FC',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    thousandCubicMetre: {
      name: 'thousandCubicMetre',
      label: 'thousand cubic metre',
      symbol: null,
      code: 'R9',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '10³m³',
      quantityKinds: ['volume', 'sectionModulus']
    },
    thousandCubicMetrePerDay: {
      name: 'thousandCubicMetrePerDay',
      label: 'thousand cubic metre per day',
      symbol: 'km³/d',
      code: 'TQD',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '1.15741 × 10⁻² m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate']
    },
    thousandPiece: {
      name: 'thousandPiece',
      label: 'thousand piece',
      symbol: null,
      code: 'T3',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    thousandSquareInch: {
      name: 'thousandSquareInch',
      label: 'thousand square inch',
      symbol: null,
      code: 'TI',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    thousandStandardBrickEquivalent: {
      name: 'thousandStandardBrickEquivalent',
      label: 'thousand standard brick equivalent',
      symbol: null,
      code: 'MBE',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tonAssay: {
      name: 'tonAssay',
      label: 'ton, assay',
      symbol: null,
      code: 'M85',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '2.916667 × 10⁻² kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    tonForceUsShort: {
      name: 'tonForceUsShort',
      label: 'ton-force (US short)',
      symbol: 'ton.sh-force',
      code: 'L94',
      referenceUnit: function () {
        return sammUDefinition.units['newton'];
      },
      conversionFactor: '8.896443 × 10³ N',
      quantityKinds: ['weight', 'force', 'force', 'weight']
    },
    tonLongPerDay: {
      name: 'tonLongPerDay',
      label: 'ton long per day',
      symbol: 'ton (UK)/d',
      code: 'L85',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '1.175980 × 10⁻² kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonRegister: {
      name: 'tonRegister',
      label: 'ton, register',
      symbol: 'RT',
      code: 'M70',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '2.831685 m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    tonShortPerDay: {
      name: 'tonShortPerDay',
      label: 'ton short per day',
      symbol: 'ton (US)/d',
      code: 'L88',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '1.049982 × 10⁻² kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonShortPerDegreeFahrenheit: {
      name: 'tonShortPerDegreeFahrenheit',
      label: 'ton short per degree Fahrenheit',
      symbol: 'ton (US)/°F',
      code: 'L87',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerKelvin'];
      },
      conversionFactor: '1.632932 × 10³ kg/K',
      quantityKinds: ['mass', 'volumicMass', 'massDensity', 'density']
    },
    tonShortPerHourDegreeFahrenheit: {
      name: 'tonShortPerHourDegreeFahrenheit',
      label: 'ton short per hour degree Fahrenheit',
      symbol: 'ton (US)/(h·°F)',
      code: 'L89',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    tonShortPerHourPsi: {
      name: 'tonShortPerHourPsi',
      label: 'ton short per hour psi',
      symbol: '(ton (US)/h)/psi',
      code: 'L90',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecondPascal'];
      },
      conversionFactor: '3.654889 × 10⁻⁵ (kg/s)/Pa',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonShortPerPsi: {
      name: 'tonShortPerPsi',
      label: 'ton short per psi',
      symbol: 'ton (US)/psi',
      code: 'L91',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    tonUkLongPerCubicYard: {
      name: 'tonUkLongPerCubicYard',
      label: 'ton (UK long) per cubic yard',
      symbol: 'ton.l/yd³ (UK)',
      code: 'L92',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '1.328939 × 10³ kg/m³',
      quantityKinds: [
        'density',
        'massDensity',
        'volumicMass',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    tonUkOrLongTonUs: {
      name: 'tonUkOrLongTonUs',
      label: 'ton (UK) or long ton (US)',
      symbol: 'ton (UK)',
      code: 'LTN',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '1.016047 × 10³ kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass', 'mass']
    },
    tonUkShipping: {
      name: 'tonUkShipping',
      label: 'ton (UK shipping)',
      symbol: 'British shipping ton',
      code: 'L84',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.1893 m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    tonUsOrShortTonUkorus: {
      name: 'tonUsOrShortTonUkorus',
      label: 'ton (US) or short ton (UK/US)',
      symbol: 'ton (US)',
      code: 'STN',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '0.9071847 × 10³ kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    tonUsPerHour: {
      name: 'tonUsPerHour',
      label: 'ton (US) per hour',
      symbol: 'ton (US) /h',
      code: '4W',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '2.519958 × 10⁻¹ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonUsShipping: {
      name: 'tonUsShipping',
      label: 'ton (US shipping)',
      symbol: '(US) shipping ton',
      code: 'L86',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetre'];
      },
      conversionFactor: '1.1326 m³',
      quantityKinds: ['volume', 'volume', 'sectionModulus']
    },
    tonUsShortPerCubicYard: {
      name: 'tonUsShortPerCubicYard',
      label: 'ton (US short) per cubic yard',
      symbol: 'ton.s/yd³ (US)',
      code: 'L93',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '1.186553 × 10³ kg/m³',
      quantityKinds: [
        'density',
        'volumicMass',
        'massDensity',
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB'
      ]
    },
    tonneKilometre: {
      name: 'tonneKilometre',
      label: 'tonne kilometre',
      symbol: 't·km',
      code: 'TKM',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramMetre'];
      },
      conversionFactor: '10⁶ kg × m',
      quantityKinds: ['torque', 'momentOfForce', 'momentOfACouple']
    },
    tonneMetricTon: {
      name: 'tonneMetricTon',
      label: 'tonne (metric ton)',
      symbol: 't',
      code: 'TNE',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '10³ kg',
      quantityKinds: ['massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass', 'mass']
    },
    tonnePerBar: {
      name: 'tonnePerBar',
      label: 'tonne per bar',
      symbol: 't/bar',
      code: 'L70',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerPascal'];
      },
      conversionFactor: '10⁻² kg/Pa',
      quantityKinds: ['density', 'massDensity', 'volumicMass', 'volumicMass', 'massDensity', 'density']
    },
    tonnePerCubicMetre: {
      name: 'tonnePerCubicMetre',
      label: 'tonne per cubic metre',
      symbol: 't/m³',
      code: 'D41',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetre'];
      },
      conversionFactor: '10³ kg/m³',
      quantityKinds: [
        'volumicMass',
        'concentrationOfB',
        'amountOfSubstance',
        'density',
        'massDensity',
        'massConcentrationOfB',
        'density',
        'massDensity',
        'volumicMass'
      ]
    },
    tonnePerCubicMetreBar: {
      name: 'tonnePerCubicMetreBar',
      label: 'tonne per cubic metre bar',
      symbol: '(t/m³)/bar',
      code: 'L77',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerCubicMetrePascal'];
      },
      conversionFactor: '10⁻² (kg/m³)/Pa',
      quantityKinds: ['volumicMass', 'massDensity', 'density', 'density', 'massDensity', 'volumicMass']
    },
    tonnePerCubicMetreKelvin: {
      name: 'tonnePerCubicMetreKelvin',
      label: 'tonne per cubic metre kelvin',
      symbol: '(t/m³)/K',
      code: 'L76',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['volumicMass', 'massDensity', 'density']
    },
    tonnePerDay: {
      name: 'tonnePerDay',
      label: 'tonne per day',
      symbol: 't/d',
      code: 'L71',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '1.15741 × 10⁻² kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerDayBar: {
      name: 'tonnePerDayBar',
      label: 'tonne per day bar',
      symbol: '(t/d)/bar',
      code: 'L73',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecondPascal'];
      },
      conversionFactor: '1.15741 × 10⁻⁷ (kg/s)/Pa',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerDayKelvin: {
      name: 'tonnePerDayKelvin',
      label: 'tonne per day kelvin',
      symbol: '(t/d)/K',
      code: 'L72',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    tonnePerHour: {
      name: 'tonnePerHour',
      label: 'tonne per hour',
      symbol: 't/h',
      code: 'E18',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '2.77778 × 10⁻¹ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerHourBar: {
      name: 'tonnePerHourBar',
      label: 'tonne per hour bar',
      symbol: '(t/h)/bar',
      code: 'L75',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecondPascal'];
      },
      conversionFactor: '2.77778 × 10⁻⁶ (kg/s)/Pa',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerHourKelvin: {
      name: 'tonnePerHourKelvin',
      label: 'tonne per hour kelvin',
      symbol: '(t/h)/K',
      code: 'L74',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    tonnePerKelvin: {
      name: 'tonnePerKelvin',
      label: 'tonne per kelvin',
      symbol: 't/K',
      code: 'L69',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerKelvin'];
      },
      conversionFactor: '10³ kg/K',
      quantityKinds: ['mass', 'volumicMass', 'massDensity', 'density']
    },
    tonnePerMinute: {
      name: 'tonnePerMinute',
      label: 'tonne per minute',
      symbol: 't/min',
      code: 'L78',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '16.6667 kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerMinuteBar: {
      name: 'tonnePerMinuteBar',
      label: 'tonne per minute bar',
      symbol: '(t/min)/bar',
      code: 'L80',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecondPascal'];
      },
      conversionFactor: '1.66667 × 10⁻⁴ (kg/s)/Pa',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerMinuteKelvin: {
      name: 'tonnePerMinuteKelvin',
      label: 'tonne per minute kelvin',
      symbol: '(t/min)/K',
      code: 'L79',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    tonnePerMonth: {
      name: 'tonnePerMonth',
      label: 'tonne per month',
      symbol: 't/mo',
      code: 'M88',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '3.80257053768 × 10⁻⁴ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerSecond: {
      name: 'tonnePerSecond',
      label: 'tonne per second',
      symbol: 't/s',
      code: 'L81',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '10³ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerSecondBar: {
      name: 'tonnePerSecondBar',
      label: 'tonne per second bar',
      symbol: '(t/s)/bar',
      code: 'L83',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecondPascal'];
      },
      conversionFactor: '10⁻² (kg/s)/Pa',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    tonnePerSecondKelvin: {
      name: 'tonnePerSecondKelvin',
      label: 'tonne per second kelvin',
      symbol: '(t/s)/K',
      code: 'L82',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['massFlowRate']
    },
    tonnePerYear: {
      name: 'tonnePerYear',
      label: 'tonne per year',
      symbol: 't/y',
      code: 'M89',
      referenceUnit: function () {
        return sammUDefinition.units['kilogramPerSecond'];
      },
      conversionFactor: '3.168808781 × 10⁻⁵ kg/s',
      quantityKinds: ['massFlowRate', 'massFlowRate']
    },
    torrPerMetre: {
      name: 'torrPerMetre',
      label: 'torr per metre',
      symbol: 'Torr/m',
      code: 'P85',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['hardnessIndex']
    },
    totalAcidNumber: {
      name: 'totalAcidNumber',
      label: 'total acid number',
      symbol: 'TAN',
      code: 'TAN',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    treatment: {
      name: 'treatment',
      label: 'treatment',
      symbol: null,
      code: 'U1',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    trillionEur: {
      name: 'trillionEur',
      label: 'trillion (EUR)',
      symbol: null,
      code: 'TRL',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    trip: {
      name: 'trip',
      label: 'trip',
      symbol: null,
      code: 'E54',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tropicalYear: {
      name: 'tropicalYear',
      label: 'tropical year',
      symbol: 'y (tropical)',
      code: 'D42',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '3.155692 5 × 10⁷ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'time'
      ]
    },
    troyOunceOrApothecaryOunce: {
      name: 'troyOunceOrApothecaryOunce',
      label: 'troy ounce or apothecary ounce',
      symbol: 'tr oz',
      code: 'APZ',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '3.110348 × 10⁻³ kg',
      quantityKinds: ['mass', 'massOfAtomOfANuclideX', 'massExcess', 'mass', 'effectiveMass', 'massOfMolecule', 'nuclidicMass']
    },
    troyPoundUs: {
      name: 'troyPoundUs',
      label: 'troy pound (US)',
      symbol: null,
      code: 'LBT',
      referenceUnit: function () {
        return sammUDefinition.units['gram'];
      },
      conversionFactor: '373.2417 g',
      quantityKinds: ['mass']
    },
    twentyFootContainer: {
      name: 'twentyFootContainer',
      label: 'twenty foot container',
      symbol: null,
      code: '20',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    tyre: {
      name: 'tyre',
      label: 'tyre',
      symbol: null,
      code: 'E23',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    unifiedAtomicMassUnit: {
      name: 'unifiedAtomicMassUnit',
      label: 'unified atomic mass unit',
      symbol: 'u',
      code: 'D43',
      referenceUnit: function () {
        return sammUDefinition.units['kilogram'];
      },
      conversionFactor: '1.660 538 782 × 10⁻²⁷ kg',
      quantityKinds: [
        'nuclidicMass',
        'unifiedAtomicMassConstant',
        'massOfMolecule',
        'massOfAtomOfANuclideX',
        'massDefect',
        'massOfAtomOfANuclideX',
        'massExcess',
        'mass',
        'effectiveMass',
        'massOfMolecule',
        'nuclidicMass'
      ]
    },
    unitPole: {
      name: 'unitPole',
      label: 'unit pole',
      symbol: 'unit pole',
      code: 'P53',
      referenceUnit: function () {
        return sammUDefinition.units['weber'];
      },
      conversionFactor: '1.256637 × 10⁻⁷ Wb',
      quantityKinds: ['magneticFluxQuantum', 'magneticFlux', 'magneticFluxQuantum']
    },
    usGallonPerMinute: {
      name: 'usGallonPerMinute',
      label: 'US gallon per minute',
      symbol: 'gal (US) /min',
      code: 'G2',
      referenceUnit: function () {
        return sammUDefinition.units['cubicMetrePerSecond'];
      },
      conversionFactor: '6.309020 × 10⁻⁵ m³/s',
      quantityKinds: ['volumeFlowRate', 'recombinationCoefficient', 'instantaneousVolumeFlowRate', 'volumeFlowRate']
    },
    use: {
      name: 'use',
      label: 'use',
      symbol: null,
      code: 'E55',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    var: {
      name: 'var',
      label: 'var',
      symbol: 'var',
      code: 'D44',
      referenceUnit: function () {
        return sammUDefinition.units['voltAmpere'];
      },
      conversionFactor: 'V × A',
      quantityKinds: ['apparentPower', 'reactivePower']
    },
    volt: {
      name: 'volt',
      label: 'volt',
      symbol: 'V',
      code: 'VLT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'thermoelectromotiveForceBetweenSubstancesAAndB',
        'electricPotential',
        'peltierCoefficientForSubstancesAAndB',
        'electromotiveForce',
        'potentialDifference',
        'tension',
        'voltage'
      ]
    },
    voltAc: {
      name: 'voltAc',
      label: 'volt AC',
      symbol: 'V',
      code: '2G',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    voltAmpere: {
      name: 'voltAmpere',
      label: 'volt - ampere',
      symbol: 'V·A',
      code: 'D46',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: 'W',
      quantityKinds: [
        'apparentPower',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    voltAmperePerKilogram: {
      name: 'voltAmperePerKilogram',
      label: 'volt - ampere per kilogram',
      symbol: 'V·A / kg',
      code: 'VA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    voltDc: {
      name: 'voltDc',
      label: 'volt DC',
      symbol: 'V',
      code: '2H',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    voltPerBar: {
      name: 'voltPerBar',
      label: 'volt per bar',
      symbol: 'V/bar',
      code: 'G60',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltPerCentimetre: {
      name: 'voltPerCentimetre',
      label: 'volt per centimetre',
      symbol: 'V/cm',
      code: 'D47',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltPerInch: {
      name: 'voltPerInch',
      label: 'volt per inch',
      symbol: 'V/in',
      code: 'H23',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltPerKelvin: {
      name: 'voltPerKelvin',
      label: 'volt per kelvin',
      symbol: 'V/K',
      code: 'D48',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['seebeckCoefficientForSubstancesAAndB']
    },
    voltPerLitreMinute: {
      name: 'voltPerLitreMinute',
      label: 'volt per litre minute',
      symbol: 'V/(l·min)',
      code: 'F87',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltPerMetre: {
      name: 'voltPerMetre',
      label: 'volt per metre',
      symbol: 'V/m',
      code: 'D50',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltPerMicrosecond: {
      name: 'voltPerMicrosecond',
      label: 'volt per microsecond',
      symbol: 'V/µs',
      code: 'H24',
      referenceUnit: function () {
        return sammUDefinition.units['voltPerSecond'];
      },
      conversionFactor: '10⁶ V/s',
      quantityKinds: ['electricFieldStrength', 'electricFieldStrength']
    },
    voltPerMillimetre: {
      name: 'voltPerMillimetre',
      label: 'volt per millimetre',
      symbol: 'V/mm',
      code: 'D51',
      referenceUnit: function () {
        return sammUDefinition.units['voltPerMetre'];
      },
      conversionFactor: '10³ V/m',
      quantityKinds: ['electricFieldStrength', 'electricFieldStrength']
    },
    voltPerPascal: {
      name: 'voltPerPascal',
      label: 'volt per pascal',
      symbol: 'V/Pa',
      code: 'N98',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltPerSecond: {
      name: 'voltPerSecond',
      label: 'volt per second',
      symbol: 'V/s',
      code: 'H46',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltSecondPerMetre: {
      name: 'voltSecondPerMetre',
      label: 'volt second per metre',
      symbol: 'V·s/m',
      code: 'H45',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltSquareInchPerPoundForce: {
      name: 'voltSquareInchPerPoundForce',
      label: 'volt square inch per pound-force',
      symbol: 'V/(lbf/in²)',
      code: 'H22',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    voltSquaredPerKelvinSquared: {
      name: 'voltSquaredPerKelvinSquared',
      label: 'volt squared per kelvin squared',
      symbol: 'V²/K²',
      code: 'D45',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['electricFieldStrength']
    },
    waterHorsePower: {
      name: 'waterHorsePower',
      label: 'water horse power',
      symbol: null,
      code: 'F80',
      referenceUnit: function () {
        return sammUDefinition.units['watt'];
      },
      conversionFactor: '7.46043 × 10² W',
      quantityKinds: [
        'power',
        'heatFlowRate',
        'power',
        'activePower',
        'radiantEnergyflux',
        'powerForDirectCurrent',
        'radiantPower',
        'soundPower'
      ]
    },
    watt: {
      name: 'watt',
      label: 'watt',
      symbol: 'W',
      code: 'WTT',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['heatFlowRate', 'power', 'activePower', 'radiantEnergyflux', 'powerForDirectCurrent', 'radiantPower', 'soundPower']
    },
    wattHour: {
      name: 'wattHour',
      label: 'watt hour',
      symbol: 'W·h',
      code: 'WHR',
      referenceUnit: function () {
        return sammUDefinition.units['joule'];
      },
      conversionFactor: '3.6 × 10³ J',
      quantityKinds: [
        'helmholtzFunction',
        'helmholtzFreeEnergy',
        'energyImparted',
        'hartreeEnergy',
        'heat',
        'work',
        'meanEnergyImparted',
        'workFunction',
        'thermodynamicEnergy',
        'alphaDisintegrationEnergy',
        'activeEnergy',
        'enthalpy',
        'potentialEnergy',
        'levelWidth',
        'energy',
        'reactionEnergy',
        'quantityOfHeat',
        'kineticEnergy',
        'radiantEnergy',
        'energy',
        'kineticEnergy',
        'potentialEnergy',
        'activeEnergy',
        'work'
      ]
    },
    wattPerCubicMetre: {
      name: 'wattPerCubicMetre',
      label: 'watt per cubic metre',
      symbol: 'W/m³',
      code: 'H47',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['irradiance', 'firstRadiationConstant', 'fluenceRate', 'radiantEnergy', 'radiantExitance']
    },
    wattPerKelvin: {
      name: 'wattPerKelvin',
      label: 'watt per kelvin',
      symbol: 'W/K',
      code: 'D52',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['thermalConductance']
    },
    wattPerKilogram: {
      name: 'wattPerKilogram',
      label: 'watt per kilogram',
      symbol: 'W/kg',
      code: 'WA',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    wattPerMetre: {
      name: 'wattPerMetre',
      label: 'watt per metre',
      symbol: 'W/m',
      code: 'H74',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['irradiance', 'firstRadiationConstant', 'radiantEnergy', 'radiantExitance', 'fluenceRate']
    },
    wattPerMetreDegreeCelsius: {
      name: 'wattPerMetreDegreeCelsius',
      label: 'watt per metre degree Celsius',
      symbol: 'W/(m·°C)',
      code: 'N80',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerMetreKelvin'];
      },
      conversionFactor: 'W/(m × K)',
      quantityKinds: ['thermalConductivity', 'thermalConductivity']
    },
    wattPerMetreKelvin: {
      name: 'wattPerMetreKelvin',
      label: 'watt per metre kelvin',
      symbol: 'W/(m·K)',
      code: 'D53',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['thermalConductivity']
    },
    wattPerSquareCentimetre: {
      name: 'wattPerSquareCentimetre',
      label: 'watt per square centimetre',
      symbol: 'W/cm²',
      code: 'N48',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '10⁴ W/m²',
      quantityKinds: [
        'densityOfHeatFlowRate',
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance'
      ]
    },
    wattPerSquareInch: {
      name: 'wattPerSquareInch',
      label: 'watt per square inch',
      symbol: 'W/in²',
      code: 'N49',
      referenceUnit: function () {
        return sammUDefinition.units['wattPerSquareMetre'];
      },
      conversionFactor: '1.550003 × 10³ W/m²',
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance',
        'densityOfHeatFlowRate'
      ]
    },
    wattPerSquareMetre: {
      name: 'wattPerSquareMetre',
      label: 'watt per square metre',
      symbol: 'W/m²',
      code: 'D54',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: [
        'firstRadiationConstant',
        'densityOfHeatFlowRate',
        'energyFluxDensity',
        'irradiance',
        'poyntingVector',
        'fluenceRate',
        'energyFluenceRate',
        'soundIntensity',
        'radiantEnergy',
        'radiantExitance'
      ]
    },
    wattPerSquareMetreKelvin: {
      name: 'wattPerSquareMetreKelvin',
      label: 'watt per square metre kelvin',
      symbol: 'W/(m²·K)',
      code: 'D55',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['coefficientOfHeatTransfer']
    },
    wattPerSquareMetreKelvinToTheFourthPower: {
      name: 'wattPerSquareMetreKelvinToTheFourthPower',
      label: 'watt per square metre kelvin to the fourth power',
      symbol: 'W/(m²·K⁴)',
      code: 'D56',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['stefanBoltzmannConstant']
    },
    wattPerSteradian: {
      name: 'wattPerSteradian',
      label: 'watt per steradian',
      symbol: 'W/sr',
      code: 'D57',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['radiantIntensity']
    },
    wattPerSteradianSquareMetre: {
      name: 'wattPerSteradianSquareMetre',
      label: 'watt per steradian square metre',
      symbol: 'W/(sr·m²)',
      code: 'D58',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['radiance']
    },
    wattSecond: {
      name: 'wattSecond',
      label: 'watt second',
      symbol: 'W·s',
      code: 'J55',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['quantityOfHeat', 'enthalpy', 'energy', 'thermodynamicEnergy', 'heat', 'helmholtzFunction', 'helmholtzFreeEnergy']
    },
    wattSquareMetre: {
      name: 'wattSquareMetre',
      label: 'watt square metre',
      symbol: 'W·m²',
      code: 'Q21',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    weber: {
      name: 'weber',
      label: 'weber',
      symbol: 'Wb',
      code: 'WEB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticFluxQuantum', 'magneticFlux']
    },
    weberMetre: {
      name: 'weberMetre',
      label: 'weber metre',
      symbol: 'Wb·m',
      code: 'P50',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticDipoleMoment']
    },
    weberPerMetre: {
      name: 'weberPerMetre',
      label: 'weber per metre',
      symbol: 'Wb/m',
      code: 'D59',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: ['magneticVectorPotential']
    },
    weberPerMillimetre: {
      name: 'weberPerMillimetre',
      label: 'weber per millimetre',
      symbol: 'Wb/mm',
      code: 'D60',
      referenceUnit: function () {
        return sammUDefinition.units['weberPerMetre'];
      },
      conversionFactor: '10³ Wb/m',
      quantityKinds: ['magneticVectorPotential', 'magneticVectorPotential']
    },
    weberToThePowerMinusOne: {
      name: 'weberToThePowerMinusOne',
      label: 'weber to the power minus one',
      symbol: '1/Wb',
      code: 'Q23',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    week: {
      name: 'week',
      label: 'week',
      symbol: 'wk',
      code: 'WEE',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '6.048 × 10⁵ s',
      quantityKinds: [
        'time',
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant'
      ]
    },
    well: {
      name: 'well',
      label: 'well',
      symbol: null,
      code: 'E56',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    wetKilo: {
      name: 'wetKilo',
      label: 'wet kilo',
      symbol: null,
      code: 'W2',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    wetPound: {
      name: 'wetPound',
      label: 'wet pound',
      symbol: null,
      code: 'WB',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    wetTon: {
      name: 'wetTon',
      label: 'wet ton',
      symbol: null,
      code: 'WE',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    wineGallon: {
      name: 'wineGallon',
      label: 'wine gallon',
      symbol: null,
      code: 'WG',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    workingDay: {
      name: 'workingDay',
      label: 'working day',
      symbol: null,
      code: 'E49',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    workingMonth: {
      name: 'workingMonth',
      label: 'working month',
      symbol: null,
      code: 'WM',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    },
    yard: {
      name: 'yard',
      label: 'yard',
      symbol: 'yd',
      code: 'YRD',
      referenceUnit: function () {
        return sammUDefinition.units['metre'];
      },
      conversionFactor: '0.9144 m',
      quantityKinds: [
        'thickness',
        'radiusOfCurvature',
        'cartesianCoordinates',
        'radius',
        'breadth',
        'height',
        'length',
        'distance',
        'lengthOfPath',
        'diameter',
        'slowingDownLength',
        'electronRadius',
        'breadth',
        'particlePositionVector',
        'diffusionLength',
        'wavelength',
        'cartesianCoordinates',
        'height',
        'radiusOfCurvature',
        'meanFreePath',
        'migrationLength',
        'latticeVector',
        'bohrRadius',
        'coherenceLength',
        'displacementVectorOfIonOrAtom',
        'distance',
        'comptonWavelength',
        'diffusionCoefficientForNeutronFluenceRate',
        'lengthOfPath',
        'focalDistance',
        'halfValueThickness',
        'meanLinearRange',
        'equilibriumPositionVectorOfIonOrAtom',
        'diameter',
        'halfThickness',
        'fundamentalLatticeVector',
        'length',
        'objectDistance',
        'londonPenetrationDepth',
        'radius',
        'imageDistance',
        'meanFreePathOfPhononsOrElectrons',
        'thickness',
        'instantaneousSoundParticleDisplacement',
        'nuclearRadius',
        'diffusionCoefficientForNeutronFluxDensity'
      ]
    },
    yardPerDegreeFahrenheit: {
      name: 'yardPerDegreeFahrenheit',
      label: 'yard per degree Fahrenheit',
      symbol: 'yd/°F',
      code: 'L98',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerKelvin'];
      },
      conversionFactor: '1.64592 m/K',
      quantityKinds: [
        'distance',
        'diameter',
        'height',
        'thickness',
        'length',
        'cartesianCoordinates',
        'lengthOfPath',
        'radiusOfCurvature',
        'radius',
        'breadth',
        'distance',
        'radius',
        'height',
        'breadth',
        'lengthOfPath',
        'thickness',
        'length',
        'cartesianCoordinates',
        'diameter',
        'radiusOfCurvature'
      ]
    },
    yardPerHour: {
      name: 'yardPerHour',
      label: 'yard per hour',
      symbol: 'yd/h',
      code: 'M66',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '2.54 × 10⁻⁴ m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'groupVelocity',
        'phaseVelocity',
        'velocity'
      ]
    },
    yardPerMinute: {
      name: 'yardPerMinute',
      label: 'yard per minute',
      symbol: 'yd/min',
      code: 'M65',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '1.524 × 10⁻² m/s',
      quantityKinds: [
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity',
        'phaseVelocity',
        'groupVelocity',
        'velocity'
      ]
    },
    yardPerPsi: {
      name: 'yardPerPsi',
      label: 'yard per psi',
      symbol: 'yd/psi',
      code: 'L99',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerPascal'];
      },
      conversionFactor: '1.326225 × 10⁻⁴ m/Pa',
      quantityKinds: [
        'lengthOfPath',
        'radiusOfCurvature',
        'distance',
        'radius',
        'thickness',
        'cartesianCoordinates',
        'diameter',
        'breadth',
        'length',
        'height',
        'diameter',
        'lengthOfPath',
        'distance',
        'length',
        'thickness',
        'height',
        'cartesianCoordinates',
        'radius',
        'radiusOfCurvature',
        'breadth'
      ]
    },
    yardPerSecond: {
      name: 'yardPerSecond',
      label: 'yard per second',
      symbol: 'yd/s',
      code: 'M64',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecond'];
      },
      conversionFactor: '9.144 × 10⁻¹ m/s',
      quantityKinds: [
        'velocity',
        'phaseVelocity',
        'groupVelocity',
        'instantaneousSoundParticleVelocity',
        'neutronSpeed',
        'phaseSpeedOfElectromagneticWaves',
        'velocitySpeedOnPropagationOfElectromagneticWavesInVacuo',
        'velocity',
        'velocityOfSoundPhaseVelocity',
        'phaseVelocityOfElectromagneticWaves',
        'groupVelocity',
        'phaseVelocity'
      ]
    },
    yardPerSecondSquared: {
      name: 'yardPerSecondSquared',
      label: 'yard per second squared',
      symbol: 'yd/s²',
      code: 'M40',
      referenceUnit: function () {
        return sammUDefinition.units['metrePerSecondSquared'];
      },
      conversionFactor: '9.144 × 10⁻¹ m/s²',
      quantityKinds: [
        'accelerationOfFreeFall',
        'acceleration',
        'accelerationDueToGravity',
        'accelerationDueToGravity',
        'accelerationOfFreeFall',
        'instantaneousSoundParticleAcceleration',
        'acceleration'
      ]
    },
    year: {
      name: 'year',
      label: 'year',
      symbol: 'y',
      code: 'ANN',
      referenceUnit: function () {
        return sammUDefinition.units['secondUnitOfTime'];
      },
      conversionFactor: '3.15576 × 10⁷ s',
      quantityKinds: [
        'halfLife',
        'periodicTime',
        'reverberationTime',
        'relaxationTime',
        'period',
        'timeConstant',
        'meanLife',
        'time',
        'carrierLifeTime',
        'reactorTimeConstant',
        'time'
      ]
    },
    yobibyte: {
      name: 'yobibyte',
      label: 'Yobibyte',
      symbol: 'YiB',
      code: null,
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '2⁸⁰ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    yottabyte: {
      name: 'yottabyte',
      label: 'Yottabyte',
      symbol: 'YB',
      code: null,
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '10²⁴ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    zebibyte: {
      name: 'zebibyte',
      label: 'Zebibyte',
      symbol: 'ZiB',
      code: null,
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '2⁷⁰ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    zettabyte: {
      name: 'zettabyte',
      label: 'Zettabyte',
      symbol: 'ZB',
      code: null,
      referenceUnit: function () {
        return sammUDefinition.units['byte'];
      },
      conversionFactor: '10²¹ B',
      quantityKinds: ['informationEntropy', 'informationEntropy']
    },
    zone: {
      name: 'zone',
      label: 'zone',
      symbol: null,
      code: 'E57',
      referenceUnit: null,
      conversionFactor: null,
      quantityKinds: null
    }
  }
};
