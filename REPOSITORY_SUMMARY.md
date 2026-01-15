# Repository Summary: NZC Easy Audit

## Project Overview

**NZC Easy Audit** is a Salesforce Lightning component accelerator designed for Net Zero Cloud (NZC) that provides step-by-step emissions calculations and audit instructions. The solution displays detailed calculation methodologies for both vehicle and stationary energy use records, helping users understand how emissions are calculated in Net Zero Cloud.

### Purpose
The accelerator enables users to view transparent, step-by-step emissions calculations directly on VehicleAssetEnrgyUse and StnryAssetEnrgyUse records, providing an audit trail and educational tool for understanding Net Zero Cloud's emissions calculation engine.

### Technology Stack
- **Platform**: Salesforce Platform (SFDX)
- **Source API Version**: 65.0
- **UI Framework**: Lightning Web Components (LWC) + Aura Components
- **Backend**: Apex (with sharing)
- **Testing**: Jest (LWC), Apex Test Classes
- **Package Management**: npm (for development tools)
- **Version Control**: Git

---

## Directory Structure

```
NZC-EasyAudit/
├── force-app/main/default/          # Main metadata directory
│   ├── aura/                         # Aura Components
│   │   └── NZC_EasyAuditShell/       # Aura wrapper component
│   ├── classes/                      # Apex Classes
│   │   ├── NZC_EasyAuditConstants.cls
│   │   ├── NZC_EasyAuditControllerV2.cls
│   │   ├── NZC_EasyAuditControllerV2Test.cls
│   │   └── NZC_EasyAuditInfoWrapper.cls
│   └── lwc/                          # Lightning Web Components
│       ├── nZC_EasyAudit/            # Main orchestrator component
│       ├── nZC_EasyAuditLogging/     # Logging utility
│       ├── nZC_EasyAuditStationaryCalc/  # Stationary calculator
│       ├── nZC_EasyAuditStep/        # Step display component
│       ├── nZC_EasyAuditUnitConversion/  # Unit conversion utility
│       └── nZC_EasyAuditVehicleCalc/  # Vehicle calculator
├── config/                           # Configuration files
│   └── project-scratch-def.json     # Scratch org definition
├── scripts/                          # Utility scripts
│   ├── apex/                         # Apex scripts
│   └── soql/                         # SOQL queries
├── .cursor/                          # Cursor IDE rules
├── CONTRIBUTING.md                   # Contribution guidelines
├── LICENSE.md                        # Apache 2.0 License
├── README.md                         # Project documentation
├── package.json                      # npm dependencies
├── sfdx-project.json                 # SFDX project configuration
└── package.xml                       # Metadata package definition
```

---

## Component Architecture

### Component Hierarchy

```
NZC_EasyAuditShell (Aura)
    └── nZC_EasyAudit (LWC)
        ├── NZC_EasyAuditControllerV2 (Apex)
        │   ├── NZC_EasyAuditInfoWrapper (Data Wrapper)
        │   ├── VehicleAssetEnrgyUse (Object)
        │   └── StnryAssetEnrgyUse (Object)
        ├── nZC_EasyAuditVehicleCalc (JS Class)
        │   ├── nZC_EasyAuditUnitConversion (Utility)
        │   └── nZC_EasyAuditLogging (Logger)
        ├── nZC_EasyAuditStationaryCalc (JS Class)
        │   ├── nZC_EasyAuditUnitConversion (Utility)
        │   └── nZC_EasyAuditLogging (Logger)
        └── nZC_EasyAuditStep (LWC Display)
```

### Component Details

#### Aura Components

**NZC_EasyAuditShell** (`force-app/main/default/aura/NZC_EasyAuditShell/`)
- **Purpose**: Aura wrapper component that implements `force:hasRecordId` and `flexipage:availableForRecordHome` interfaces
- **Files**:
  - `NZC_EasyAuditShell.cmp` - Component markup
  - `NZC_EasyAuditShellController.js` - Controller (minimal, just initialization)
  - `NZC_EasyAuditShell.css` - Styles (minimal)
- **Functionality**: Passes recordId to the embedded LWC component

#### Lightning Web Components

**nZC_EasyAudit** (`force-app/main/default/lwc/nZC_EasyAudit/`)
- **Purpose**: Main orchestrator component that determines record type and initiates calculations
- **Key Methods**:
  - `connectedCallback()` - Initializes component and fetches record data
  - `serverCallGetAuditInfo()` - Calls Apex to retrieve record information
  - `startCalculation()` - Routes to appropriate calculator based on object type
- **Properties**:
  - `@api recordId` - Record ID from parent
  - `@track instructions` - Array of calculation steps to display
- **Dependencies**: 
  - Apex: `NZC_EasyAuditControllerV2.getRecordInfo`
  - LWC: `nZC_EasyAuditVehicleCalc`, `nZC_EasyAuditStationaryCalc`

**nZC_EasyAuditStep** (`force-app/main/default/lwc/nZC_EasyAuditStep/`)
- **Purpose**: Displays individual calculation steps in accordion format
- **Properties**:
  - `@api stepInstruction` - Step data object containing title, descriptions, final value, and record links
- **UI**: Uses `lightning-accordion-section` for expandable step display

**nZC_EasyAuditVehicleCalc** (`force-app/main/default/lwc/nZC_EasyAuditVehicleCalc/`)
- **Purpose**: JavaScript class that performs vehicle emissions calculations
- **Key Features**:
  - Handles various fuel types (Diesel, Gasoline, Electricity, etc.)
  - Supports multiple unit conversions (MPG, L/100km, gallons, liters, miles, kilometers)
  - Calculates emissions for different vehicle types (including Private Jets)
  - Generates step-by-step calculation instructions
- **Constants**: Fuel efficiency conversion factors, unit conversion constants
- **Dependencies**: `nZC_EasyAuditLogging`, `nZC_EasyAuditUnitConversion`

**nZC_EasyAuditStationaryCalc** (`force-app/main/default/lwc/nZC_EasyAuditStationaryCalc/`)
- **Purpose**: JavaScript class that performs stationary asset emissions calculations
- **Key Features**:
  - Handles electricity, fuel, and refrigerant emissions
  - Supports Scope 1, Scope 2 (location-based and market-based) calculations
  - Calculates Power Usage Effectiveness (PUE) for data centers
  - Handles floor area conversions
- **Dependencies**: `nZC_EasyAuditLogging`, `nZC_EasyAuditUnitConversion`

**nZC_EasyAuditUnitConversion** (`force-app/main/default/lwc/nZC_EasyAuditUnitConversion/`)
- **Purpose**: Utility class for unit conversions across different measurement systems
- **Features**: 
  - Conversion factor lookup tables
  - Handles various unit types (G_PER_KL, KG_PER_MJ, etc.)
  - Standardizes units for calculation consistency

**nZC_EasyAuditLogging** (`force-app/main/default/lwc/nZC_EasyAuditLogging/`)
- **Purpose**: Logging utility class for building calculation step instructions
- **Key Methods**:
  - `startStep(title)` - Begins a new calculation step
  - `addLine(textString)` - Adds a line of description
  - `addFinalValue(value)` - Sets the final calculated value
  - `addRecordLink(recordName, recordId)` - Adds clickable record links
  - `finishCalculation()` - Returns array of completed steps
  - `logFlexibleFuels(customFuelConversionString)` - Logs custom fuel conversions

#### Apex Classes

**NZC_EasyAuditControllerV2** (`force-app/main/default/classes/NZC_EasyAuditControllerV2.cls`)
- **Purpose**: Main Apex controller that retrieves and processes record data
- **Key Methods**:
  - `getRecordInfo(String recordId)` - @AuraEnabled method called from LWC
  - `processWrapper()` - Routes to vehicle or stationary processing
  - `getVehicleInfo()` - Retrieves and processes vehicle energy use data
  - `getStationaryInfo()` - Retrieves and processes stationary energy use data
  - `getSetItemInfo()` - Retrieves emission factor set items
  - `getCustomFuelOrUnits()` - Retrieves custom fuel/unit conversions
- **Security**: `with sharing` - respects user permissions
- **Dependencies**: `NZC_EasyAuditInfoWrapper`, `NZC_EasyAuditConstants`

**NZC_EasyAuditInfoWrapper** (`force-app/main/default/classes/NZC_EasyAuditInfoWrapper.cls`)
- **Purpose**: Data wrapper class that structures record information for calculation processing
- **Key Properties**: 
  - Record metadata (objectName, recordId, baseUrl)
  - Fuel data (FuelType, FuelConsumption, FuelConsumptionUnit)
  - Distance data (Distance, DistanceUnit) - for vehicles
  - Emission factors (CO2, CH4, N2O, GWP values)
  - Scope information (Scope1, Scope2, Scope3)
  - Custom fuel conversion data
- **Key Methods**:
  - `populateVehicleValues()` - Populates wrapper from vehicle record
  - `populateStationaryValues()` - Populates wrapper from stationary record
  - `populateEmissionsValues()` - Populates emission factor data
  - `populateScope()` - Determines emissions scope based on fuel type and ownership
  - `isCustomFuelOrUnit()` - Checks if custom fuel/unit conversion is needed
  - `convertFuelType()` - Handles custom fuel type conversions

**NZC_EasyAuditConstants** (`force-app/main/default/classes/NZC_EasyAuditConstants.cls`)
- **Purpose**: Constants class containing object names, scope types, and fuel type constants
- **Key Constants**:
  - Object names: `OBJECT_STATIONARY_USE`, `OBJECT_VEHICLE_USE`
  - Scope types: `SCOPE1`, `SCOPE2`, `SCOPE3`
  - Fuel types: `FUEL_ELECTRICITY`, `FUEL_DIESEL`, `FUEL_NATURALGAS`, etc.
  - `DEFAULT_OWNED_SCOPE` - Map of fuel types to default scope assignments

**NZC_EasyAuditControllerV2Test** (`force-app/main/default/classes/NZC_EasyAuditControllerV2Test.cls`)
- **Purpose**: Test class for controller functionality
- **Coverage**: Tests vehicle and stationary record processing, custom fuel handling
- **Test Methods**:
  - `testProcessStationary()` - Tests stationary energy use processing
  - `testProcessVehicle()` - Tests vehicle energy use processing
  - `testCustomFuel()` - Tests custom fuel type conversion

---

## Data Model

### Key Salesforce Objects

**VehicleAssetEnrgyUse** (Net Zero Cloud Standard Object)
- **Purpose**: Tracks vehicle energy consumption and emissions
- **Key Fields Used**:
  - `FuelConsumption`, `FuelConsumptionUnit`, `FuelType`
  - `Distance`, `DistanceUnit`
  - `OtherEmssnFctrId` (lookup to OtherEmssnFctrSet)
  - `FlightDurationInHours`, `AircraftFuelEconomy`, `AircraftFuelEconomyUnit`
  - `SuplScope1Emissions`
  - `VehicleAssetEmssnSrc` (parent relationship)

**StnryAssetEnrgyUse** (Net Zero Cloud Standard Object)
- **Purpose**: Tracks stationary asset energy consumption and emissions
- **Key Fields Used**:
  - `FuelConsumption`, `FuelConsumptionUnit`, `FuelType`
  - `SuplScope1Emissions`, `SuplScope2LocationBasedEmssn`, `SuplScope2MarketBasedEmssn`
  - `PowerUsageEffectiveness`, `OccupiedFloorArea`, `OccupiedFloorAreaUnit`
  - `ElectricityEmissionFactorsId`, `RefrigerantEmssnFctrId`, `OtherEmssnFctrId`
  - `AllocatedRenewableEnergyInKwh`
  - `StnryAssetEnvrSrc` (parent relationship)

**OtherEmssnFctrSet** (Net Zero Cloud Standard Object)
- **Purpose**: Emission factor sets for various fuel types
- **Key Fields**: `Ch4GlblWarmingPot`, `N2oGlblWarmingPot`

**OtherEmssnFctrSetItem** (Net Zero Cloud Standard Object)
- **Purpose**: Individual emission factors within a set
- **Key Fields**:
  - `Co2EmissionFactor`, `Co2EmissionFactorUnit`
  - `Ch4EmissionFactor`, `Ch4EmissionFactorUnit`
  - `N2oEmissionFactor`, `N2oEmissionFactorUnit`
  - `CalorificValue`, `CalorificValueUnit`
  - `SuppliedEmissionsFactor`, `SuppliedEmissionsFactorUnit`
  - `Co2eEmissionFactorInTco2eMwh`

**ElectricityEmssnFctrSet** (Net Zero Cloud Standard Object)
- **Purpose**: Electricity emission factors
- **Key Fields**: `Co2eEmissionRate`, `Co2eEmissionRateUnit`

**RefrigerantEmssnFctr** (Net Zero Cloud Standard Object)
- **Purpose**: Refrigerant emission factors
- **Key Fields**: `GlblWarmingPotInKgCo2eKg`

**SustnUomConversion** (Net Zero Cloud Standard Object)
- **Purpose**: Unit conversion factors for custom fuels/units
- **Key Fields**: `FuelType`, `SourceUom`, `TargetUom`, `ConversionFactor`

**FuelType** (Net Zero Cloud Standard Object)
- **Purpose**: Custom fuel type definitions
- **Key Fields**: `MasterLabel`, `DeveloperName`

**SustainabilityUom** (Net Zero Cloud Standard Object)
- **Purpose**: Custom unit of measure definitions
- **Key Fields**: `MasterLabel`, `DeveloperName`

---

## Key Features and Functionality

### 1. Vehicle Emissions Calculations
- Supports multiple fuel types (Diesel, Gasoline, Electricity, CNG, etc.)
- Handles various distance and fuel consumption units
- Calculates emissions for standard vehicles and aircraft (including Private Jets)
- Supports fuel efficiency conversions (MPG ↔ L/100km)
- Displays step-by-step calculation methodology

### 2. Stationary Emissions Calculations
- Supports electricity, fuel, and refrigerant emissions
- Calculates Scope 1, Scope 2 (location-based and market-based) emissions
- Handles Power Usage Effectiveness (PUE) for data centers
- Supports floor area conversions (m² ↔ sq ft)
- Handles renewable energy allocation

### 3. Unit Conversion Engine
- Comprehensive unit conversion support
- Handles custom fuel types and units via Net Zero Cloud flexible fuels framework
- Automatic unit standardization for calculations
- Conversion factor lookup tables

### 4. Custom Fuel Support
- Detects custom fuel types and units
- Retrieves conversion factors from SustnUomConversion
- Displays conversion process in calculation steps
- Supports flexible fuels framework

### 5. Scope Determination
- Automatically determines emissions scope based on:
  - Fuel type
  - Asset ownership (company-owned vs. not)
  - Record type
- Uses DEFAULT_OWNED_SCOPE mapping for standard fuel types

### 6. Interactive UI
- Accordion-based step display
- Clickable record links to related objects
- Clear calculation methodology presentation
- Responsive Lightning Web Component design

---

## Development Workflow

### Prerequisites
- Salesforce CLI (latest version)
- Node.js and npm (for LWC Jest tests)
- Git
- Salesforce org with Net Zero Cloud enabled

### Setup
1. Clone repository: `git clone https://github.com/jvillalpando_sfemu/NZC-EasyAudit.git`
2. Install dependencies: `npm install`
3. Authorize org: `sf org login web --alias MyOrg`
4. Deploy: `sf project deploy start --source-dir force-app --target-org MyOrg`

### Development Commands
- **Lint**: `npm run lint` - Runs ESLint on Aura and LWC JavaScript
- **Test**: `npm test` - Runs Jest unit tests
- **Test Watch**: `npm run test:unit:watch` - Runs tests in watch mode
- **Test Coverage**: `npm run test:unit:coverage` - Generates coverage report
- **Format**: `npm run prettier` - Formats all code files
- **Format Check**: `npm run prettier:verify` - Checks formatting without changes

### Code Quality
- **ESLint**: Configured with Salesforce LWC and Aura plugins
- **Prettier**: Code formatting with Apex plugin support
- **Husky**: Git hooks for pre-commit linting and formatting
- **Lint-staged**: Runs linters only on staged files

### Testing
- **LWC Tests**: Jest-based unit tests in component directories
- **Apex Tests**: `NZC_EasyAuditControllerV2Test` provides >75% coverage
- **Test Data**: Test class includes setup methods for creating test records

---

## Integration Points

### Net Zero Cloud Integration
- **Objects**: Directly integrates with Net Zero Cloud standard objects
- **Emission Factors**: Uses Net Zero Cloud emission factor sets
- **Flexible Fuels**: Supports Net Zero Cloud flexible fuels framework
- **Scope Calculation**: Aligns with Net Zero Cloud scope determination logic

### Salesforce Platform Integration
- **Lightning Platform**: Uses Lightning Web Components and Aura Components
- **Record Pages**: Implements `flexipage:availableForRecordHome` interface
- **Security**: Uses `with sharing` to respect user permissions
- **URL Generation**: Uses `Url.getSalesforceBaseUrl()` for record links

### External Dependencies
- **npm Packages**: All development dependencies are public packages
  - `@salesforce/eslint-config-lwc`
  - `@salesforce/sfdx-lwc-jest`
  - `prettier`, `eslint`, `husky`, etc.

---

## Best Practices and Guidelines

### Code Organization
- **Separation of Concerns**: Clear separation between UI (LWC), business logic (Apex), and calculation logic (JS classes)
- **Reusability**: Utility classes (UnitConversion, Logging) are shared across calculators
- **Constants**: Centralized constants in `NZC_EasyAuditConstants` class

### Security
- **Sharing**: All Apex classes use `with sharing` to respect user permissions
- **Field-Level Security**: Respects FLS settings on Net Zero Cloud objects
- **Input Validation**: Record ID validation through Apex

### Performance
- **Single Apex Call**: One Apex call retrieves all necessary data
- **Client-Side Calculations**: Calculations performed in JavaScript to reduce server load
- **Lazy Loading**: Component only loads when record page is accessed

### Maintainability
- **Copyright Headers**: All source files include Apache 2.0 license headers
- **Documentation**: Inline comments for complex calculation logic
- **Test Coverage**: Comprehensive test coverage for critical paths

---

## Deployment

### Deployment Methods
1. **One-Click Deploy**: GitHub Deploy button (for admins)
2. **Workbench**: Upload package.zip file
3. **Salesforce CLI**: `sf project deploy start` (for developers)
4. **CI/CD**: Compatible with Gearset, Copado, Flosum

### Post-Deployment Steps
1. Verify component deployment in Setup
2. Add component to Lightning Record Pages
3. Test with sample VehicleAssetEnrgyUse and StnryAssetEnrgyUse records
4. Configure permissions if needed

---

## File Count Summary

- **Aura Components**: 1
- **Lightning Web Components**: 6
- **Apex Classes**: 4 (3 production, 1 test)
- **Total Source Files**: ~20 files (excluding metadata XML files)

---

## License

This project is licensed under the **Apache License 2.0** - see [LICENSE.md](LICENSE.md) for details.

---

## Additional Resources

- **README.md**: Comprehensive project documentation with installation and usage instructions
- **CONTRIBUTING.md**: Guidelines for contributing to the project
- **GitHub Repository**: https://github.com/jvillalpando_sfemu/NZC-EasyAudit

---

*This document is optimized for LLM consumption and provides a comprehensive overview of the repository structure, architecture, and components. For detailed implementation details, refer to the source code files.*
