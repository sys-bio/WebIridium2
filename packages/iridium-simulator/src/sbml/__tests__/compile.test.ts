import { expect, describe, it } from "vitest";
import { compileSbml } from "../compile";
import type { IridiumModel } from "../../ir/model";
import {
  algebraicRule,
  algebraicVariable,
  assignmentVariable,
  event,
  expr,
  model,
  parameter,
  rateVariable,
  reaction,
  species,
} from "../../ir/dsl";

import defaultModel from "./timeCourses/default.xml?raw";
import { toComparableModel } from "../../testingUtils/ir";
import { SbmlCompileError } from "../errors";

const expectModel = (sbml: string, expected: IridiumModel) => {
  const got = compileSbml(sbml);
  expect(toComparableModel(got)).toMatchObject(toComparableModel(expected));
};

const expectModelExact = (sbml: string, expected: IridiumModel) => {
  const got = compileSbml(sbml);
  expect(toComparableModel(got)).toEqual(toComparableModel(expected));
};

it("should compile default model", () => {
  expectModel(
    defaultModel,
    model({
      variables: {
        default_compartment: parameter(1),
        A: species(10),
        B: species(0),
        C: species(0),
        k1: parameter(0.35),
        k2: parameter(0.2),
      },
      reactions: {
        _J0: reaction(
          { A: 1 },
          { B: 1 },
          expr.builtinCall("times", [expr.var("k1"), expr.var("A")]),
        ),
        _J1: reaction(
          { B: 1 },
          { C: 1 },
          expr.builtinCall("times", [expr.var("k2"), expr.var("B")]),
        ),
      },
      compartments: {
        default_compartment: ["A", "B", "C"],
      },
    }),
  );
});

describe("compartments", () => {
  it("should add compartments", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment id="C" spatialDimensions="3" constant="true" size="10" />
    </listOfCompartments>
  </model>
</sbml>`,
      model({
        variables: {
          C: parameter(10),
        },
        compartments: {
          C: [],
        },
      }),
    );
  });

  it("should add compartments and assign default size", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment id="C" spatialDimensions="99" constant="true"/>
    </listOfCompartments>
  </model>
</sbml>`,
      model({
        variables: {
          C: parameter(1),
        },
        compartments: {
          C: [],
        },
      }),
    );
  });

  it("should error on duplicate compartments", () => {
    expect(() => {
      compileSbml(
        `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment id="C" spatialDimensions="99" constant="true"/>
      <compartment id="C" spatialDimensions="99" constant="true"/>
    </listOfCompartments>
  </model>
</sbml>`,
      );
    }).toThrowError(SbmlCompileError);
  });
});

describe("parameter", () => {
  it("should add parameters", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="5" constant="true"/>
    </listOfParameters>
  </model>
</sbml>`,
      model({
        variables: {
          A: parameter(5),
        },
      }),
    );
  });

  it("should add parameters and assign default values", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" constant="true"/>
    </listOfParameters>
  </model>
</sbml>`,
      model({
        variables: {
          A: parameter(0),
        },
      }),
    );
  });

  it("should error on duplicate parameters", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="5" constant="true"/>
      <parameter id="A" value="5" constant="true"/>
    </listOfParameters>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });
});

describe("species", () => {
  it("should process species with no initial value", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="S" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false" />
    </listOfSpecies>
  </model>
</sbml>`,
      model({
        variables: {
          S: parameter(0),
        },
        compartments: {
          default_compartment: ["S"],
        },
      }),
    );
  });

  it("should process species with initialConcentration", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="S" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false" initialConcentration="10" />
    </listOfSpecies>
  </model>
</sbml>`,
      model({
        variables: {
          S: parameter(10),
        },
        compartments: {
          default_compartment: ["S"],
        },
      }),
    );
  });

  it("should process species with initialAmount", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="S" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false" initialAmount="10" />
    </listOfSpecies>
  </model>
</sbml>`,
      model({
        variables: {
          S: parameter(expr.div(expr.num(10), expr.var("default_compartment"))),
        },
        compartments: {
          default_compartment: ["S"],
        },
      }),
    );
  });

  it("should process hasOnlySubstanceUnits species with initialConcentration", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="2" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="S" compartment="default_compartment" hasOnlySubstanceUnits="true" boundaryCondition="false" constant="false" initialConcentration="10" />
    </listOfSpecies>
  </model>
</sbml>`,
      model({
        variables: {
          S: {
            hasSubstanceOnly: true,
            value: {
              kind: "initial",
              initial: expr.mul(expr.num(10), expr.var("default_compartment")),
            },
          },
        },
        compartments: {
          default_compartment: ["S"],
        },
      }),
    );
  });

  it("should process hasOnlySubstanceUnits species with initialAmount", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="2" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="S" compartment="default_compartment" hasOnlySubstanceUnits="true" boundaryCondition="false" constant="false" initialAmount="10" />
    </listOfSpecies>
  </model>
</sbml>`,
      model({
        variables: {
          S: {
            hasSubstanceOnly: true,
            value: {
              kind: "initial",
              initial: expr.num(10),
            },
          },
        },
        compartments: {
          default_compartment: ["S"],
        },
      }),
    );
  });

  it("should process species with conversionFactor", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="S" compartment="default_compartment" initialConcentration="3" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false" conversionFactor="A" />
    </listOfSpecies>
    <listOfParameters>
      <parameter id="A" value="5" constant="true"/>
    </listOfParameters>
  </model>
</sbml>
`,
      model({
        variables: {
          S: {
            hasSubstanceOnly: false,
            value: {
              kind: "reaction",
              initial: expr.num(3),
              conversionFactor: expr.var("A"),
            },
          },
        },
        compartments: {
          default_compartment: ["S"],
        },
      }),
    );
  });

  it("should error on duplicate species", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="2" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="S" compartment="default_compartment" hasOnlySubstanceUnits="true" boundaryCondition="false" constant="false" initialConcentration="10" />
      <species id="S" compartment="default_compartment" hasOnlySubstanceUnits="true" boundaryCondition="false" constant="false" initialConcentration="10" />
    </listOfSpecies>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });
});

describe("initial assignment", () => {
  it("should update parameters", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" constant="true"/>
      <parameter id="B" value="10" constant="true"/>
      <parameter id="C" constant="true"/>
    </listOfParameters>
    <listOfInitialAssignments>
      <initialAssignment symbol="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> B </ci>
            <cn type="integer"> 5 </cn>
          </apply>
        </math>
      </initialAssignment>
      <initialAssignment symbol="C">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> A </ci>
            <cn type="integer"> 5 </cn>
          </apply>
        </math>
      </initialAssignment>
    </listOfInitialAssignments>
  </model>
</sbml>`,
      model({
        variables: {
          A: parameter(expr.builtinCall("plus", [expr.var("B"), expr.num(5)])),
          B: parameter(10),
          C: parameter(expr.builtinCall("plus", [expr.var("A"), expr.num(5)])),
        },
      }),
    );
  });

  it("should update species", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="B" value="10" constant="true"/>
    </listOfParameters>
    <listOfInitialAssignments>
      <initialAssignment symbol="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> B </ci>
            <cn type="integer"> 5 </cn>
          </apply>
        </math>
      </initialAssignment>
    </listOfInitialAssignments>
  </model>
</sbml>
`,
      model({
        variables: {
          A: parameter(expr.builtinCall("plus", [expr.var("B"), expr.num(5)])),
          B: parameter(10),
        },
        compartments: {
          default_compartment: ["A"],
        },
      }),
    );
  });

  it("should update compartment", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment id="A" spatialDimensions="3" constant="true"/>
    </listOfCompartments>
    <listOfParameters>
      <parameter id="B" value="10" constant="true"/>
    </listOfParameters>
    <listOfInitialAssignments>
      <initialAssignment symbol="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> B </ci>
            <cn type="integer"> 5 </cn>
          </apply>
        </math>
      </initialAssignment>
    </listOfInitialAssignments>
  </model>
</sbml>`,
      model({
        variables: {
          A: parameter(expr.builtinCall("plus", [expr.var("B"), expr.num(5)])),
          B: parameter(10),
        },
        compartments: {
          A: [],
        },
      }),
    );
  });

  it("should error with unknown symbol", () => {
    expect(() => {
      compileSbml(`
<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfInitialAssignments>
      <initialAssignment symbol="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> B </ci>
            <cn type="integer"> 5 </cn>
          </apply>
        </math>
      </initialAssignment>
    </listOfInitialAssignments>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it("should error when assigning to reaction", () => {
    expect(() => {
      compileSbml(`
<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference species="A" stoichiometry="1" constant="true"/>
        </listOfReactants>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
    <listOfInitialAssignments>
      <initialAssignment symbol="J">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> B </ci>
            <cn type="integer"> 5 </cn>
          </apply>
        </math>
      </initialAssignment>
    </listOfInitialAssignments>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });
});

describe("rate rule", () => {
  it("should update value of parameter", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="0" constant="false"/>
    </listOfParameters>
    <listOfRules>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 1 </cn>
        </math>
      </rateRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: rateVariable(expr.num(0), expr.num(1)),
        },
      }),
    );
  });

  it("should update value of boundary species", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" initialConcentration="1" hasOnlySubstanceUnits="false" boundaryCondition="true" constant="false"/>
    </listOfSpecies>
    <listOfRules>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 1 </cn>
        </math>
      </rateRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: rateVariable(expr.num(1), expr.num(1)),
        },
        compartments: {
          default_compartment: ["A"],
        },
      }),
    );
  });

  it("should merge with initial assignment", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" constant="false"/>
    </listOfParameters>
    <listOfInitialAssignments>
      <initialAssignment symbol="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <pi/>
            <cn type="integer"> 5 </cn>
          </apply>
        </math>
      </initialAssignment>
    </listOfInitialAssignments>
    <listOfRules>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 3 </cn>
        </math>
      </rateRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: rateVariable(
            expr.builtinCall("plus", [expr.builtinVar("pi"), expr.num(5)]),
            expr.num(3),
          ),
        },
      }),
    );
  });

  it("should error when trying to set rate of reaction", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfReactions>
      <reaction id="J" reversible="true" />
    </listOfReactions>
    <listOfRules>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 3 </cn>
        </math>
      </rateRule>
    </listOfRules>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it("should error when trying to set rate of const object", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="0" constant="true"/>
    </listOfParameters>
    <listOfRules>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 1 </cn>
        </math>
      </rateRule>
    </listOfRules>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it("should error when trying to set rate of object with assignment rule", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfReactions>
      <reaction id="J" reversible="true" />
    </listOfReactions>
    <listOfRules>
      <assignmentRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 3 </cn>
        </math>
      </assignmentRule>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 3 </cn>
        </math>
      </rateRule>
    </listOfRules>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it.skip("should error when trying to set rate of floating species", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" initialConcentration="1" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfRules>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 1 </cn>
        </math>
      </rateRule>
    </listOfRules>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });
});

describe("assignment rule", () => {
  it("should update value of parameter", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="5" constant="false"/>
    </listOfParameters>
    <listOfRules>
      <assignmentRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 5 </cn>
        </math>
      </assignmentRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: assignmentVariable(expr.num(5)),
        },
      }),
    );
  });

  it("should update value of boundary species", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" initialConcentration="5" hasOnlySubstanceUnits="false" boundaryCondition="true" constant="false"/>
    </listOfSpecies>
    <listOfRules>
      <assignmentRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 5 </cn>
        </math>
      </assignmentRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: assignmentVariable(expr.num(5)),
        },
        compartments: {
          default_compartment: ["A"],
        },
      }),
    );
  });

  it.skip("should error when trying to set value of floating species", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" initialConcentration="5" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfRules>
      <assignmentRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 5 </cn>
        </math>
      </assignmentRule>
    </listOfRules>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it("should error when trying to assign const object", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="5" constant="true"/>
    </listOfParameters>
    <listOfRules>
      <assignmentRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 5 </cn>
        </math>
      </assignmentRule>
    </listOfRules>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it("should error when trying to assign to object with rate rule", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfReactions>
      <reaction id="J" reversible="true" />
    </listOfReactions>
    <listOfRules>
      <assignmentRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 3 </cn>
        </math>
      </assignmentRule>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 3 </cn>
        </math>
      </rateRule>
    </listOfRules>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });
});

describe("algebraic rule", () => {
  it("should add algebraic rule and update variable kinds", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="1" constant="false"/>
      <parameter id="B" value="1" constant="false"/>
    </listOfParameters>
    <listOfRules>
      <algebraicRule id="alg">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> A </ci>
            <ci> B </ci>
          </apply>
        </math>
      </algebraicRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: algebraicVariable(1),
          B: algebraicVariable(1),
        },
        algebraicRules: {
          alg: algebraicRule(
            expr.builtinCall("plus", [expr.var("A"), expr.var("B")]),
          ),
        },
      }),
    );
  });

  it("should not update variable with assignment rule to have algebraic value kind", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="1" constant="false"/>
      <parameter id="B" value="1" constant="false"/>
    </listOfParameters>
    <listOfRules>
      <assignmentRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 1 </cn>
        </math>
      </assignmentRule>
      <algebraicRule id="alg">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> A </ci>
            <ci> B </ci>
          </apply>
        </math>
      </algebraicRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: assignmentVariable(expr.num(1)),
          B: algebraicVariable(1),
        },
        algebraicRules: {
          alg: algebraicRule(
            expr.builtinCall("plus", [expr.var("A"), expr.var("B")]),
          ),
        },
      }),
    );
  });

  it("should not update variable with rate rule to have algebraic value kind", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="0" constant="false"/>
      <parameter id="B" value="1" constant="false"/>
    </listOfParameters>
    <listOfRules>
      <rateRule variable="A">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <cn type="integer"> 1 </cn>
        </math>
      </rateRule>
      <algebraicRule id="alg">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> A </ci>
            <ci> B </ci>
          </apply>
        </math>
      </algebraicRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: rateVariable(expr.num(0), expr.num(1)),
          B: algebraicVariable(1),
        },
        algebraicRules: {
          alg: algebraicRule(
            expr.builtinCall("plus", [expr.var("A"), expr.var("B")]),
          ),
        },
      }),
    );
  });

  it("should not update const variable to have algebraic value kind", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="1" constant="true"/>
      <parameter id="B" value="1" constant="false"/>
    </listOfParameters>
    <listOfRules>
      <algebraicRule id="alg">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> A </ci>
            <ci> B </ci>
          </apply>
        </math>
      </algebraicRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: parameter(1),
          B: algebraicVariable(1),
        },
        algebraicRules: {
          alg: algebraicRule(
            expr.builtinCall("plus", [expr.var("A"), expr.var("B")]),
          ),
        },
      }),
    );
  });

  it("should update boundary species to have algebraic value kind but not floating species", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" initialConcentration="1" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="B" compartment="default_compartment" initialConcentration="1" hasOnlySubstanceUnits="false" boundaryCondition="true" constant="false"/>
    </listOfSpecies>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference species="A" stoichiometry="1" constant="true"/>
        </listOfReactants>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
    <listOfRules>
      <algebraicRule id="alg">
        <math xmlns="http://www.w3.org/1998/Math/MathML">
          <apply>
            <plus/>
            <ci> A </ci>
            <ci> B </ci>
          </apply>
        </math>
      </algebraicRule>
    </listOfRules>
  </model>
</sbml>`,
      model({
        variables: {
          A: species(1),
          B: algebraicVariable(1),
        },
        algebraicRules: {
          alg: algebraicRule(
            expr.builtinCall("plus", [expr.var("A"), expr.var("B")]),
          ),
        },
        compartments: {
          default_compartment: ["A", "B"],
        },
      }),
    );
  });
});

describe("reactions", () => {
  it("should add reactants", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference species="A" stoichiometry="1" constant="true"/>
        </listOfReactants>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`,
      model({
        reactions: {
          J: reaction({ A: 1 }, {}, expr.var("k1")),
        },
        compartments: {
          default_compartment: ["A"],
        },
      }),
    );
  });

  it("should add products", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfProducts>
          <speciesReference species="A" stoichiometry="1" constant="true"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`,
      model({
        reactions: {
          J: reaction({}, { A: 1 }, expr.var("k1")),
        },
        compartments: {
          default_compartment: ["A"],
        },
      }),
    );
  });

  it("should add constant stoichiometries", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference species="A" stoichiometry="2" constant="true"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference species="A" stoichiometry="3" constant="true"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`,
      model({
        reactions: {
          J: reaction({ A: 2 }, { A: 3 }, expr.var("k1")),
        },
        compartments: {
          default_compartment: ["A"],
        },
      }),
    );
  });

  it("should add repeated terms", () => {
    expectModel(
      `
<?xml version="1.0" encoding="UTF-8"?>
<!-- Created by libAntimony version v2.15.0 with libSBML version 5.20.0. -->
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference species="A" stoichiometry="2" constant="true"/>
          <speciesReference species="A" stoichiometry="4" constant="true"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference species="A" stoichiometry="3" constant="true"/>
          <speciesReference species="A" stoichiometry="5" constant="true"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>
`,
      model({
        reactions: {
          J: {
            reactants: [
              { name: "A", stoichiometry: expr.num(2) },
              { name: "A", stoichiometry: expr.num(4) },
            ],
            products: [
              { name: "A", stoichiometry: expr.num(3) },
              { name: "A", stoichiometry: expr.num(5) },
            ],
            rate: expr.var("k1"),
          },
        },
        compartments: {
          default_compartment: ["A"],
        },
      }),
    );
  });

  it("should add variable stoichiometries", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<!-- Created by libAntimony version v2.15.0 with libSBML version 5.20.0. -->
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="B" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference id="n1" species="A" constant="true"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference id="n2" species="B" constant="true"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`,
      model({
        variables: {
          n1: parameter(1),
          n2: parameter(1),
          A: species(0),
          B: species(0),
        },
        reactions: {
          J: reaction(
            { A: expr.var("n1") },
            { B: expr.var("n2") },
            expr.var("k1"),
          ),
        },
        compartments: {
          default_compartment: ["A", "B"],
        },
      }),
    );
  });

  it("should add local parameters", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfReactions>
      <reaction id="J" reversible="true">
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
          <listOfLocalParameters>
            <localParameter id="k1" value="1" />
          </listOfLocalParameters>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`,
      model({
        variables: {
          "$local;J;k1;0": parameter(1),
        },
        reactions: {
          J: reaction({}, {}, expr.var("$local;J;k1;0")),
        },
      }),
    );

    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfReactions>
      <reaction id="J" reversible="true">
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply><times/>
              <ci> k1 </ci>
              <ci> k1 </ci>
              <cn> 5 </cn>
            </apply>
          </math>
          <listOfLocalParameters>
            <localParameter id="k1" value="1" />
          </listOfLocalParameters>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`,
      model({
        variables: {
          "$local;J;k1;0": parameter(1),
        },
        reactions: {
          J: reaction(
            {},
            {},
            expr.builtinCall("times", [
              expr.var("$local;J;k1;0"),
              expr.var("$local;J;k1;0"),
              expr.num(5),
            ]),
          ),
        },
      }),
    );
  });

  it("should add local parameters with default value", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfReactions>
      <reaction id="J" reversible="true">
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
          <listOfLocalParameters>
            <localParameter id="k1" />
          </listOfLocalParameters>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`,
      model({
        variables: {
          "$local;J;k1;0": parameter(0),
        },
        reactions: {
          J: reaction({}, {}, expr.var("$local;J;k1;0")),
        },
      }),
    );
  });

  it("should error on duplicate stoichiometries", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="B" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference id="n1" species="A" constant="true"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference id="n1" species="B" constant="true"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it("should error on duplicate local parameters", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="B" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference id="n1" species="A" constant="true"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference id="n1" species="B" constant="true"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
          <listOfLocalParameters>
            <localParameter>
            </localParameter>
          </listOfLocalParameters>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it("should error with local parameters outside list", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="B" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference id="n1" species="A" constant="true"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference id="n1" species="B" constant="true"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
          <localParameter>
          </localParameter>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });

  it("should error with local parameters with same name as referenced species", () => {
    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="B" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <listOfReactants>
          <speciesReference species="A" stoichiometry="1" constant="true"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference species="B" stoichiometry="1" constant="true"/>
        </listOfProducts>
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
          <listOfLocalParameters>
            <localParameter id="A" />
          </listOfLocalParameters>
        </kineticLaw>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);

    expect(() => {
      compileSbml(`<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfCompartments>
      <compartment sboTerm="SBO:0000410" id="default_compartment" spatialDimensions="3" size="1" constant="true"/>
    </listOfCompartments>
    <listOfSpecies>
      <species id="A" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
      <species id="B" compartment="default_compartment" hasOnlySubstanceUnits="false" boundaryCondition="false" constant="false"/>
    </listOfSpecies>
    <listOfParameters>
      <parameter id="k1" constant="true"/>
    </listOfParameters>
    <listOfReactions>
      <reaction id="J" reversible="true">
        <kineticLaw>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <ci> k1 </ci>
          </math>
          <listOfLocalParameters>
            <localParameter id="A" />
          </listOfLocalParameters>
        </kineticLaw>
        <listOfReactants>
          <speciesReference species="A" stoichiometry="1" constant="true"/>
        </listOfReactants>
        <listOfProducts>
          <speciesReference species="B" stoichiometry="1" constant="true"/>
        </listOfProducts>
      </reaction>
    </listOfReactions>
  </model>
</sbml>`);
    }).toThrowError(SbmlCompileError);
  });
});

describe("events", () => {
  const template = (
    useValuesFromTriggerTime: boolean,
    initialValue: boolean,
    persistent: boolean,
  ) => `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" constant="false"/>
    </listOfParameters>
    <listOfEvents>
      <event id="E" useValuesFromTriggerTime="${useValuesFromTriggerTime}">
        <trigger initialValue="${initialValue}" persistent="${persistent}">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <gt/>
              <csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/time"> time </csymbol>
              <cn type="integer"> 0 </cn>
            </apply>
          </math>
        </trigger>
        <listOfEventAssignments>
          <eventAssignment variable="A">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <cn type="integer"> 3 </cn>
            </math>
          </eventAssignment>
        </listOfEventAssignments>
      </event>
    </listOfEvents>
  </model>
</sbml>`;

  it("should add useValuesFromTriggerTime", () => {
    expectModel(
      template(false, true, true),
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
            },
            {
              isFromTrigger: false,
              isPersistent: true,
              isT0: true,
            },
          ),
        },
      }),
    );

    expectModel(
      template(true, true, true),
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
            },
            {
              isFromTrigger: true,
              isPersistent: true,
              isT0: true,
            },
          ),
        },
      }),
    );
  });

  it("should add trigger and its attributes", () => {
    expectModel(
      template(false, true, true),
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
            },
            {
              isFromTrigger: false,
              isPersistent: true,
              isT0: true,
            },
          ),
        },
      }),
    );

    expectModel(
      template(false, false, true),
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
            },
            {
              isFromTrigger: false,
              isPersistent: true,
              isT0: false,
            },
          ),
        },
      }),
    );

    expectModel(
      template(false, false, false),
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
            },
            {
              isFromTrigger: false,
              isPersistent: false,
              isT0: false,
            },
          ),
        },
      }),
    );
  });

  it("should add priority", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" constant="false"/>
    </listOfParameters>
    <listOfEvents>
      <event id="E" useValuesFromTriggerTime="true">
        <trigger initialValue="true" persistent="true">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <gt/>
              <csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/time"> time </csymbol>
              <cn type="integer"> 0 </cn>
            </apply>
          </math>
        </trigger>
        <priority>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <plus/>
              <cn type="integer"> 1 </cn>
              <cn type="integer"> 2 </cn>
            </apply>
          </math>
        </priority>
        <listOfEventAssignments>
          <eventAssignment variable="A">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <cn type="integer"> 3 </cn>
            </math>
          </eventAssignment>
        </listOfEventAssignments>
      </event>
    </listOfEvents>
  </model>
</sbml>`,
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
            },
            {
              isFromTrigger: true,
              isPersistent: true,
              isT0: true,
              priority: expr.builtinCall("plus", [expr.num(1), expr.num(2)]),
            },
          ),
        },
      }),
    );
  });

  it("should add delay", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" constant="false"/>
    </listOfParameters>
    <listOfEvents>
      <event id="E" useValuesFromTriggerTime="true">
        <trigger initialValue="true" persistent="true">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <gt/>
              <csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/time"> time </csymbol>
              <cn type="integer"> 0 </cn>
            </apply>
          </math>
        </trigger>
        <delay>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <plus/>
              <cn type="integer"> 1 </cn>
              <cn type="integer"> 2 </cn>
            </apply>
          </math>
        </delay>
        <listOfEventAssignments>
          <eventAssignment variable="A">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <cn type="integer"> 3 </cn>
            </math>
          </eventAssignment>
        </listOfEventAssignments>
      </event>
    </listOfEvents>
  </model>
</sbml>`,
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
            },
            {
              isFromTrigger: true,
              isPersistent: true,
              isT0: true,
              delay: expr.builtinCall("plus", [expr.num(1), expr.num(2)]),
            },
          ),
        },
      }),
    );
  });

  it("should add event assignments", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" constant="false"/>
      <parameter id="B" constant="false"/>
    </listOfParameters>
    <listOfEvents>
      <event id="E" useValuesFromTriggerTime="true">
        <trigger initialValue="true" persistent="true">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <gt/>
              <csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/time"> time </csymbol>
              <cn type="integer"> 0 </cn>
            </apply>
          </math>
        </trigger>
        <listOfEventAssignments>
          <eventAssignment variable="B">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <cn type="integer"> 5 </cn>
            </math>
          </eventAssignment>
          <eventAssignment variable="A">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <cn type="integer"> 3 </cn>
            </math>
          </eventAssignment>
        </listOfEventAssignments>
      </event>
    </listOfEvents>
  </model>
</sbml>`,
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
              B: expr.num(5),
            },
          ),
        },
      }),
    );
  });

  it("should ignore event assignments with no math", () => {
    expectModel(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" constant="false"/>
      <parameter id="B" constant="false"/>
    </listOfParameters>
    <listOfEvents>
      <event id="E" useValuesFromTriggerTime="true">
        <trigger initialValue="true" persistent="true">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <gt/>
              <csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/time"> time </csymbol>
              <cn type="integer"> 0 </cn>
            </apply>
          </math>
        </trigger>
        <listOfEventAssignments>
          <eventAssignment variable="B" />
          <eventAssignment variable="A">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <cn type="integer"> 3 </cn>
            </math>
          </eventAssignment>
        </listOfEventAssignments>
      </event>
    </listOfEvents>
  </model>
</sbml>`,
      model({
        events: {
          E: event(
            expr.builtinCall("gt", [expr.builtinVar("time"), expr.num(0)]),
            {
              A: expr.num(3),
            },
          ),
        },
      }),
    );
  });

  it("should ignore events with no event assignments", () => {
    expectModelExact(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="1" constant="false"/>
      <parameter id="B" value="1" constant="false"/>
    </listOfParameters>
    <listOfEvents>
      <event id="E" useValuesFromTriggerTime="true">
        <trigger initialValue="true" persistent="true">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <gt/>
              <csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/time"> time </csymbol>
              <cn type="integer"> 0 </cn>
            </apply>
          </math>
        </trigger>
        <listOfEventAssignments />
      </event>
    </listOfEvents>
  </model>
</sbml>`,
      model({
        variables: {
          A: parameter(1),
          B: parameter(1),
        },
      }),
    );
  });

  it("should ignore events with no trigger", () => {
    expectModelExact(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="1" constant="false"/>
      <parameter id="B" value="1" constant="false"/>
    </listOfParameters>
    <listOfEvents>
      <event id="E" useValuesFromTriggerTime="true">
        <listOfEventAssignments>
          <eventAssignment variable="B" />
          <eventAssignment variable="A">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <cn type="integer"> 3 </cn>
            </math>
          </eventAssignment>
        </listOfEventAssignments>
      </event>
    </listOfEvents>
  </model>
</sbml>`,
      model({
        variables: {
          A: parameter(1),
          B: parameter(1),
        },
      }),
    );
  });

  it("should skip event assignment that refer to non-existent variable", () => {
    expectModelExact(
      `<?xml version="1.0" encoding="UTF-8"?>
<sbml xmlns="http://www.sbml.org/sbml/level3/version2/core" level="3" version="2">
  <model metaid="__main" id="__main">
    <listOfParameters>
      <parameter id="A" value="1" constant="false"/>
      <parameter id="B" value="1" constant="false"/>
    </listOfParameters>
    <listOfEvents>
      <event id="E" useValuesFromTriggerTime="true">
        <trigger initialValue="true" persistent="true">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <apply>
              <gt/>
              <csymbol encoding="text" definitionURL="http://www.sbml.org/sbml/symbols/time"> time </csymbol>
              <cn type="integer"> 0 </cn>
            </apply>
          </math>
        </trigger>
        <listOfEventAssignments>
          <eventAssignment variable="Z">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <cn type="integer"> 3 </cn>
            </math>
          </eventAssignment>
        </listOfEventAssignments>
      </event>
    </listOfEvents>
  </model>
</sbml>`,
      model({
        variables: {
          A: parameter(1),
          B: parameter(1),
        },
      }),
    );
  });
});
