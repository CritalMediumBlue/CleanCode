
window.vars = {
    int: {
        producer: {
            val: (() => Math.random() > 0.5 ? 0 : 1), //half of the bacteria will be producers (1) and the other half, recievers (0)
            eq: (vars, params) =>   0 //This means, this value does not change
        },
        P: {
            val: (() => 10), // 10 nM is the initial value. In steady state should stay between 1 and 200 nM
            eq: (vars, params) =>  (params.Kin * vars.ext.P.val + params.Koff * vars.int.PR.val  - params.Kon * vars.int.P.val * vars.int.R.val - params.DilRate * vars.int.P.val) // [nM/s]
        },
        R: { 
            val: (() => 100), // 100 nM is the initial value. In steady state should stay between 1 and 1000 nM
            eq: (vars, params) => 
                ( params.Ksyn + params.Koff * vars.int.PR.val - params.Kon * vars.int.P.val * vars.int.R.val - params.DilRate * vars.int.R.val) // [nM/s]
        },
        PR: { 
            val: (() => 100), // 20 nM is the initial value. In steady state should stay between 1 and 100 nM
            eq: (vars, params) => 
                (params.Kon * vars.int.P.val * vars.int.R.val - params.Koff * vars.int.PR.val - params.DilRate * vars.int.PR.val) // [nM/s]
        },
        F: {
            val: (() => 0),
            eq: (vars, params) => 
                (params.KF * vars.int.R.val / (params.Kr + vars.int.R.val ) - params.DilRate * vars.int.F.val)   // [nM/s]
        },
    },

    ext: {
        P: {
            val: (() => 0), //several nM in steadystate
            eq: (vars, params) => 
                (params.Kout)  * (vars.int.producer.val === 1) - (params.Kin * vars.ext.P.val)  //secretion rate and uptake rate
        }
    }
};
 
window.params = {
    Kin:     0.8,    // 1/s  0.03 - 0.1
    Kout:    0.25,   // nM/s 
    Ksyn:    0.03,    // nM/s   (supported by literature)
    Kon:     0.001,   // nM-1s-1 (supported by literature)
    Koff:    0.04,     // 1/s-1   (calculated based on the kd and the kon)
    DilRate: 0.000256, // 1/s   (in line with a 45min doubling time)
    KF:      0.1,    // nM/s   (based on literature) 10 - 75
    Kr:      50       // nM     (based on literature)
};


