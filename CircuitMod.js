
window.vars = {
    int: {
        AimP: {
            val: 1,
            eq: (vars, params) => params.Kin * vars.ext.testField.val / (params.Kp + vars.ext.testField.val) 
                - params.Kon * vars.int.AimP.val * vars.int.AimR.val 
                - params.DilRate * vars.int.AimP.val
        },

        AimR: {
            val: 3,
            eq: (vars, params) => params.Ksyn * vars.int.AimR.val / (params.Kr + vars.int.AimR.val)
                - params.Kon * vars.int.AimP.val * vars.int.AimR.val 
                - params.DilRate * vars.int.AimR.val
        }
    },

    ext: {
        AimP: {
            val: 0.26,
            eq: (vars, params) => vars.int.AimR.val * params.Source - vars.ext.AimP.val * params.Sink
        },
        testField: {
            val: 0.26,
            eq: (vars, params) => vars.ext.AimP.val * params.Sink - vars.ext.testField.val * params.SinkTest
        }
    }
};

window.params = {
    Kin: 0.023,
    Kp: 0.08,
    Ksyn: 0.03,
    Kr: 0.37,
    Kon: 0.039,
    DilRate: 0.007,
    Source: 4,
    Sink: 4.8,
    SourceTest: 0.5,
    SinkTest: 5.04
};
