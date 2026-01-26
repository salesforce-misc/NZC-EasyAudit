# Repository Summary: NZC EasyAudit

## Project Overview

**NZC EasyAudit** is a Salesforce Net Zero Cloud accelerator that provides a comprehensive audit component for displaying step-by-step emissions calculations. The component works with both Vehicle Energy Use and Stationary Energy Use records in Net Zero Cloud, providing detailed, transparent calculations that help users understand how emissions are computed.

### Purpose
The accelerator addresses the need for transparency in emissions calculations by displaying detailed, step-by-step audit trails. Users can see exactly how emissions are calculated, including unit conversions, emission factor applications, and scope determinations.

### Technology Stack
- **Platform**: Salesforce Net Zero Cloud
- **Frontend**: Lightning Web Components (LWC), Aura Components
- **Backend**: Apex (Salesforce)
- **API Version**: 65.0
- **Testing**: Jest (for LWC), Apex Test Classes
- **Build Tools**: Salesforce CLI, npm

---

## Architecture

### Component Architecture

#### Lightning Web Components (LWC)

1. **nZC_EasyAudit** (`force-app/main/default/lwc/nZC_EasyAudit/`)
   - **Purpose**: Main orchestrator component that coordinates the audit display
   - **Key Responsibilities**:
     - Receives `recordId` via `@api`
     - Calls Apex controller to fetch record data
     - Determines record type (Vehicle vs Stationary)
     - Instantiates appropriate calculation class
     - Displays results in accordion format
   - **Dependencies**: 
     - `NZC_EasyAuditControllerV2` (Apex)
     - `nZC_EasyAuditVehicleCalc` (JS)
     - `nZC_EasyAuditStationaryCalc` (JS)
     - `nZC_EasyAuditStep` (LWC child component)

2. **nZC_EasyAuditStep** (`force-app/main/default/lwc/nZC_EasyAuditStep/`)
   - **Purpose**: Displays individual calculation steps in accordion sections
   - **Key Responsibilities**:
     - Renders calculation lines with formatting
     - Displays record links when applicable
     - Provides expandable accordion sections
   - **Props**: `stepInstruction` (object containing step data)

3. **nZC_EasyAuditVehicleCalc** (`force-app/main/default/lwc/nZC_EasyAuditVehicleCalc/`)
   - **Purpose**: JavaScript class that performs vehicle energy use emissions calculations
   - **Key Responsibilities**:
     - Processes vehicle energy use data
     - Handles fuel efficiency conversions
     - Calculates emissions for various vehicle types (including aircraft)
     - Generates step-by-step calculation instructions
   - **Dependencies**: 
     - `nZC_EasyAuditLogging` (for step creation)
     - `nZC_EasyAuditUnitConversion` (for unit conversions)

4. **nZC_EasyAuditStationaryCalc** (`force-app/main/default/lwc/nZC_EasyAuditStationaryCalc/`)
   - **Purpose**: JavaScript class that performs stationary energy use emissions calculations
   - **Key Responsibilities**:
     - Processes stationary energy use data
     - Handles electricity emission factors
     - Calculates refrigerant emissions
     - Handles PUE (Power Usage Effectiveness) calculations
     - Generates step-by-step calculation instructions
   - **Dependencies**: 
     - `nZC_EasyAuditLogging` (for step creation)
     - `nZC_EasyAuditUnitConversion` (for unit conversions)

5. **nZC_EasyAuditUnitConversion** (`force-app/main/default/lwc/nZC_EasyAuditUnitConversion/`)
   - **Purpose**: Utility module for unit conversions
   - **Key Responsibilities**:
     - Provides conversion factors for various units
     - Converts between different measurement systems
     - Handles fuel consumption unit conversions
     - Handles distance and area conversions

6. **nZC_EasyAuditLogging** (`force-app/main/default/lwc/nZC_EasyAuditLogging/`)
   - **Purpose**: Utility class for creating calculation step objects
   - **Key Responsibilities**:
     - Creates structured calculation step objects
     - Manages step collections
     - Formats calculation lines
     - Handles record link generation

#### Aura Components

1. **NZC_EasyAuditShell** (`force-app/main/default/aura/NZC_EasyAuditShell/`)
   - **Purpose**: Aura wrapper component that enables LWC to be added to Lightning pages
   - **Implements**: `force:hasRecordId`, `flexipage:availableForRecordHome`
   - **Key Responsibilities**:
     - Provides record context to LWC
     - Enables component to be added to record pages
   - **Dependencies**: `nZC_EasyAudit` (LWC)

#### Apex Classes

1. **NZC_EasyAuditControllerV2** (`force-app/main/default/classes/NZC_EasyAuditControllerV2.cls`)
   - **Purpose**: Main Apex controller that retrieves and processes energy use record data
   - **Key Methods**:
     - `getRecordInfo(String recordId)` - Public static method called from LWC
     - `getVehicleInfo()` - Retrieves vehicle energy use data
     - `getStationaryInfo()` - Retrieves stationary energy use data
     - `getSetItemInfo()` - Retrieves emission factor set items
     - `getCustomFuelOrUnits()` - Retrieves custom fuel/unit conversions
   - **Sharing**: `with sharing`
   - **Dependencies**: 
     - `NZC_EasyAuditInfoWrapper`
     - `NZC_EasyAuditConstants`
     - Net Zero Cloud objects (VehicleAssetEnrgyUse, StnryAssetEnrgyUse, etc.)

2. **NZC_EasyAuditInfoWrapper** (`force-app/main/default/classes/NZC_EasyAuditInfoWrapper.cls`)
   - **Purpose**: Data transfer object (DTO) that structures record data for frontend consumption
   - **Key Responsibilities**:
     - Wraps energy use record data
     - Provides @AuraEnabled properties for LWC access
     - Handles scope determination logic
     - Manages custom fuel/unit conversions
     - Populates data from both vehicle and stationary records
   - **Sharing**: `with sharing`
   - **Key Properties**: Fuel consumption, emission factors, scope, custom conversions, etc.

3. **NZC_EasyAuditConstants** (`force-app/main/default/classes/NZC_EasyAuditConstants.cls`)
   - **Purpose**: Centralized constants for the application
   - **Key Constants**:
     - Object names (OBJECT_STATIONARY_USE, OBJECT_VEHICLE_USE)
     - Scope values (SCOPE1, SCOPE2, SCOPE3)
     - Fuel type constants (FUEL_ELECTRICITY, FUEL_DIESEL, etc.)
     - Default scope mappings for owned assets
   - **Sharing**: `with sharing`

4. **NZC_EasyAuditControllerV2Test** (`force-app/main/default/classes/NZC_EasyAuditControllerV2Test.cls`)
   - **Purpose**: Test class for controller
   - **Coverage**: Tests vehicle and stationary processing, custom fuel handling
   - **Test Methods**:
     - `testProcessStationary()` - Tests stationary energy use processing
     - `testProcessVehicle()` - Tests vehicle energy use processing
     - `testCustomFuel()` - Tests custom fuel/unit conversion handling

---

## Data Model

### Net Zero Cloud Objects Used

1. **VehicleAssetEnrgyUse**
   - Primary object for vehicle energy use records
   - Key Fields: FuelConsumption, FuelConsumptionUnit, FuelType, Distance, DistanceUnit, FlightDurationInHours, AircraftFuelEconomy
   - Relationships: VehicleAssetEmssnSrc (parent), OtherEmssnFctr (emission factors)

2. **StnryAssetEnrgyUse**
   - Primary object for stationary energy use records
   - Key Fields: FuelConsumption, FuelConsumptionUnit, FuelType, PowerUsageEffectiveness, OccupiedFloorArea, AllocatedRenewableEnergyInKwh
   - Relationships: StnryAssetEnvrSrc (parent), OtherEmssnFctr, ElectricityEmissionFactors, RefrigerantEmssnFctr

3. **OtherEmssnFctrSetItem**
   - Emission factor set items containing CO2, CH4, N2O factors
   - Key Fields: Co2EmissionFactor, Ch4EmissionFactor, N2oEmissionFactor, CalorificValue
   - Relationships: ParentEmissionFactorId (to OtherEmssnFctrSet)

4. **OtherEmssnFctrSet**
   - Parent emission factor set
   - Key Fields: Ch4GlblWarmingPot, N2oGlblWarmingPot

5. **ElectricityEmssnFctrSet**
   - Electricity-specific emission factors
   - Key Fields: Co2eEmissionRate, LocationBasedBiomassMixPct, MarketBasedBiomassMixPct

6. **RefrigerantEmssnFctr**
   - Refrigerant emission factors
   - Key Fields: GlblWarmingPotInKgCo2eKg

7. **SustnUomConversion**
   - Unit of measure conversions for custom fuels/units
   - Key Fields: FuelType, SourceUom, TargetUom, ConversionFactor

8. **FuelType**
   - Custom fuel type definitions
   - Key Fields: MasterLabel, DeveloperName

9. **SustainabilityUom**
   - Custom unit of measure definitions
   - Key Fields: MasterLabel, DeveloperName

### Data Flow

1. **User navigates to VehicleAssetEnrgyUse or StnryAssetEnrgyUse record**
2. **LWC receives recordId** via Aura component wrapper
3. **Apex Controller queries** the energy use record with related data:
   - Energy use record fields
   - Related emission factor sets
   - Custom fuel/unit information (if applicable)
4. **InfoWrapper structures** the data into a DTO
5. **Calculation class** (VehicleCalc or StationaryCalc) processes the data:
   - Performs unit conversions
   - Applies emission factors
   - Calculates emissions by scope and gas type
   - Creates step-by-step instructions
6. **Logging utility** formats calculation steps
7. **Step component** displays each step in accordion format

---

## Key Features

### 1. Step-by-Step Calculation Display
- Transparent calculation process
- Expandable accordion interface
- Detailed mathematical steps shown
- Record links for related data

### 2. Vehicle Energy Use Calculations
- Supports multiple vehicle types (fleet vehicles, aircraft)
- Handles fuel efficiency conversions
- Calculates distance-based emissions
- Supports flight duration calculations for aircraft

### 3. Stationary Energy Use Calculations
- Electricity emission factor handling
- Refrigerant GWP calculations
- Power Usage Effectiveness (PUE) support
- Renewable energy allocation handling
- Location-based vs market-based emissions

### 4. Unit Conversion Support
- Automatic unit conversions
- Custom fuel type support
- Custom unit of measure support
- Conversion factor lookups

### 5. Scope Determination
- Automatic scope assignment based on:
  - Asset ownership (owned vs leased)
  - Fuel type
  - Record type
- Supports Scope 1, 2, and 3 emissions

### 6. Custom Fuel/Unit Framework
- Flexible fuels framework integration
- Custom fuel name and unit display
- Conversion factor application
- Standard unit fallback

---

## Directory Structure

```
NZC-EasyAudit/
├── .cursor/
│   └── rules/                    # Cursor IDE rules and guidelines
├── .husky/                       # Git hooks
├── config/                       # Salesforce project configuration
│   └── project-scratch-def.json
├── force-app/
│   └── main/
│       └── default/
│           ├── applications/      # Lightning applications
│           ├── aura/             # Aura components
│           │   └── NZC_EasyAuditShell/
│           ├── classes/         # Apex classes
│           │   ├── NZC_EasyAuditControllerV2.cls
│           │   ├── NZC_EasyAuditConstants.cls
│           │   ├── NZC_EasyAuditInfoWrapper.cls
│           │   └── NZC_EasyAuditControllerV2Test.cls
│           ├── contentassets/   # Content assets
│           ├── flexipages/      # Lightning pages
│           ├── layouts/         # Page layouts
│           ├── lwc/             # Lightning Web Components
│           │   ├── nZC_EasyAudit/
│           │   ├── nZC_EasyAuditLogging/
│           │   ├── nZC_EasyAuditStationaryCalc/
│           │   ├── nZC_EasyAuditStep/
│           │   ├── nZC_EasyAuditUnitConversion/
│           │   └── nZC_EasyAuditVehicleCalc/
│           ├── objects/         # Custom objects
│           ├── permissionsets/   # Permission sets
│           ├── staticresources/ # Static resources
│           ├── tabs/            # Custom tabs
│           └── triggers/        # Apex triggers
├── scripts/                     # Utility scripts
│   ├── apex/
│   └── soql/
├── .gitignore
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE                      # Apache 2.0 License
├── README.md                    # Project README
├── REPOSITORY_SUMMARY.md        # This file
├── eslint.config.js            # ESLint configuration
├── jest.config.js              # Jest test configuration
├── package.json                 # npm dependencies
├── package.xml                  # Salesforce package manifest
└── sfdx-project.json            # Salesforce DX project configuration
```

---

## Development Guidelines

### Code Standards

#### Apex
- Follow Apex Enterprise Patterns (fflib) where applicable
- Use `with sharing` for controllers and services
- No SOQL in loops
- Bulkify all queries
- Test coverage >75% (prefer >85%)

#### Lightning Web Components
- Use PascalCase for component names
- Use camelCase for variables and methods
- Use `@api` only for public properties
- Handle errors gracefully
- Use SLDS for styling

#### Testing
- Write unit tests for all Apex classes
- Use Jest for LWC testing
- Test bulk scenarios (200+ records)
- Use test data factories/builders
- No `SeeAllData=true`

### Architecture Patterns

#### Current Architecture
- **Controller Pattern**: Apex controller handles data retrieval
- **DTO Pattern**: InfoWrapper structures data for frontend
- **Utility Classes**: Separate calculation and conversion logic
- **Component Composition**: LWC components composed together

#### Note on fflib Patterns
The project currently uses a simplified architecture. While the workspace rules reference fflib patterns (Selectors, Services, UnitOfWork), the current implementation uses:
- Direct controller queries (not Selectors)
- No Service layer (controller directly queries)
- No UnitOfWork pattern (no DML operations)

This is acceptable for a read-only audit component but should be considered if extending functionality.

---

## Integration Points

### Net Zero Cloud Integration
- **Objects**: VehicleAssetEnrgyUse, StnryAssetEnrgyUse
- **Emission Factors**: OtherEmssnFctrSetItem, ElectricityEmssnFctrSet, RefrigerantEmssnFctr
- **Custom Framework**: SustnUomConversion, FuelType, SustainabilityUom

### Salesforce Platform
- **Lightning Platform**: Uses Lightning Web Components framework
- **Aura Framework**: Uses Aura wrapper for Lightning page compatibility
- **Salesforce Base URL**: Uses `Url.getOrgDomainUrl()` for record links (API 65.0 compatible)

### Code Quality & Security
- **SF Code Analyzer**: Integrated for continuous code quality monitoring
  - Configuration: `code-analyzer.yml`
  - Engines: PMD (Apex), ESLint disabled (configuration compatibility)
  - Flow engine disabled (Python dependency)
- **Security Enhancements**:
  - All SOQL queries use `WITH USER_MODE` to enforce user-level CRUD and FLS
  - Proper exception handling with specific exception types
  - No hardcoded IDs in test classes
  - Optimized DescribeSObjectResult usage in tests
- **Code Standards**: Follows Salesforce coding standards and Apex best practices

### External Dependencies
- **npm packages**: All Salesforce public packages (@salesforce/*)
- **No external APIs**: All data comes from Salesforce org

---

## Deployment

### Prerequisites
- Salesforce Net Zero Cloud license
- Salesforce org (Sandbox or Production)
- Salesforce CLI or deployment tool

### Deployment Methods
1. **One-Click GitHub Deploy**: Via GitHub Deploy button
2. **Workbench**: Upload zip package
3. **Salesforce CLI**: `sf project deploy start --source-dir force-app`

### Post-Deployment
1. Add `NZC_EasyAuditShell` component to Lightning pages
2. Configure on Vehicle Energy Use and/or Stationary Energy Use pages
3. Test with sample records

---

## Testing

### Apex Tests
- **Test Class**: `NZC_EasyAuditControllerV2Test`
- **Coverage**: Tests vehicle, stationary, and custom fuel scenarios
- **Test Data**: Creates test emission factor sets, energy use records

### LWC Tests
- Jest configuration in `jest.config.js`
- Test files should be in `__tests__/` folders
- Use `@salesforce/sfdx-lwc-jest` for testing

---

## Common Tasks

### Adding a New Calculation Step
1. Modify calculation class (VehicleCalc or StationaryCalc)
2. Use `CalculationStep` from `nZC_EasyAuditLogging`
3. Add step to instruction array
4. Step component will automatically render

### Adding Support for New Fuel Type
1. Add constant to `NZC_EasyAuditConstants`
2. Update scope mapping if needed
3. Add conversion factors if custom units required
4. Test with sample data

### Modifying Calculation Logic
1. Locate appropriate calculation class
2. Modify calculation methods
3. Update step generation logic
4. Test thoroughly with various scenarios
5. Update tests if needed

---

## Key Files Reference

### Entry Points
- **Aura Component**: `force-app/main/default/aura/NZC_EasyAuditShell/NZC_EasyAuditShell.cmp`
- **Main LWC**: `force-app/main/default/lwc/nZC_EasyAudit/nZC_EasyAudit.js`
- **Apex Entry**: `force-app/main/default/classes/NZC_EasyAuditControllerV2.cls`

### Core Logic
- **Vehicle Calculations**: `force-app/main/default/lwc/nZC_EasyAuditVehicleCalc/nZC_EasyAuditVehicleCalc.js`
- **Stationary Calculations**: `force-app/main/default/lwc/nZC_EasyAuditStationaryCalc/nZC_EasyAuditStationaryCalc.js`
- **Data Wrapper**: `force-app/main/default/classes/NZC_EasyAuditInfoWrapper.cls`

### Utilities
- **Unit Conversion**: `force-app/main/default/lwc/nZC_EasyAuditUnitConversion/nZC_EasyAuditUnitConversion.js`
- **Logging**: `force-app/main/default/lwc/nZC_EasyAuditLogging/nZC_EasyAuditLogging.js`
- **Constants**: `force-app/main/default/classes/NZC_EasyAuditConstants.cls`

---

## Notes for LLMs

When working with this codebase:

1. **Always read this file first** to understand the overall architecture
2. **Component relationships**: LWC components compose together; Apex provides data
3. **Data flow**: Record → Apex → InfoWrapper → Calculation Class → Step Component → Display
4. **Calculation logic**: Separated into VehicleCalc and StationaryCalc classes
5. **No DML**: This is a read-only component; no data modification occurs
6. **Net Zero Cloud**: Requires Net Zero Cloud objects and relationships
7. **Testing**: Ensure test coverage maintained when making changes

---

## Version Information

- **Source API Version**: 65.0
- **Package Version**: 55.0 (in package.xml)
- **Last Updated**: January 2026
- **Code Quality**: Integrated with SF Code Analyzer
- **Security**: All queries enforce user-level security with `WITH USER_MODE`

---

*This document is optimized for LLM consumption and provides comprehensive context for understanding and working with the NZC EasyAudit codebase.*
