
window.vars = {
    int: {
        producer: {
            val: (() => Math.random() > 0.5 ? 0 : 1), //half of the bacteria will be producers (1) and the other half, recievers (0)
            eq: (vars, params) =>   0 //This means, this value does not change
        },
        AimP: {
            val: (() => 0.5), //should stay between 0.1 and 100 nM
            eq: (vars, params) =>  (params.Kin * vars.ext.AimP.val  - params.Kon * vars.int.AimP.val * vars.int.AimR.val - params.DilRate * vars.int.AimP.val) // [nM/s]
        },
        AimR: {
            val: (() => 0.5), //should stay between 0.1 and 100 nM
            eq: (vars, params) => 
                (params.basal + params.Ksyn - params.Kon * vars.int.AimP.val * vars.int.AimR.val - params.DilRate * vars.int.AimR.val) // [nM/s]
        },
        RFP: {
            val: (() => 0),
            eq: (vars, params) => 
                (params.Krfp * vars.int.AimR.val / (params.Kr + vars.int.AimR.val ) - params.DilRate * vars.int.RFP.val) 
        },
    },

    ext: {
        AimP: {
            val: (() => 0.25),
            eq: (vars, params) => 
                (params.Kout)  * (vars.int.producer.val === 1) - (params.Kin * vars.ext.AimP.val)
        }
    }
};
 
window.params = {
    basal: 0.000,
    Kin: 1.0, 
    Kout: 0.002, 
    Ksyn: 0.0005, // between 0.01 and 0.5 nM/seconds   
    Kon: 0.002,  // between 0.0001 and 0.1 nM-1s-1
    DilRate: 0.00026, //  units:1/seconds
    Krfp: 0.001,
    Kr:1000
};
