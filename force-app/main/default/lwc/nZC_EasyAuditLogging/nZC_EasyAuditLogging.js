/**
 * Created by mverigin on 5/15/23.
 */

class CalculationStep {
    constructor(baseUrl='') {
        this.baseUrl = baseUrl;
        this.steps = [];
        this.currentInstruction = null;
    }

    startStep = (title) => {
        if (this.currentInstruction) {
            this.steps.push(this.currentInstruction);
        }
        this.currentInstruction = {title, descriptions : []}
    }

    addFinalValue = (value) => {
        if (this.currentInstruction) {
            this.currentInstruction['final'] = value;
        }
    }

    addLine = (textString) => {
        if (this.currentInstruction && this.currentInstruction.descriptions) {
            this.currentInstruction.descriptions.push(textString);
        }
    }

    addRecordLink = (recordName, recordId) => {
        if (this.currentInstruction) {
            this.currentInstruction['recordLinkName'] = recordName
            this.currentInstruction['recordLinkId'] = this.baseUrl + '/' + recordId;
        }
    }

    finishCalculation = () => {
        this.steps.push(this.currentInstruction);
        return this.steps;
    }

    logFlexibleFuels = (customFuelConversionString) => {
        if (customFuelConversionString) {
            this.startStep('Custom fuel or Custom unit conversion');
            customFuelConversionString.split(',').forEach(step =>this.addLine(step));
        }
    }
}

export default CalculationStep;