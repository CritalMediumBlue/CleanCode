
window.vars = {
    int: {
        producer: {
            val: (() => Math.random() > 0.5 ? 0 : 1), //half of the bacteria will be producers (1) and the other half, recievers (0)
            eq: (vars, params) =>   0 //This means, this value does not change
        },
        P: {
            val: (() => 10), // 10 nM is the initial value. In steady state should stay between 1 and 200 nM
            eq: (vars, params) =>  (params.Kin * vars.ext.P.val  - params.Kon * vars.int.P.val * vars.int.R.val - params.DilRate * vars.int.P.val) // [nM/s]
        },
        R: { 
            val: (() => 10), // 10 nM is the initial value. In steady state should stay between 1 and 200 nM
            eq: (vars, params) => 
                (params.basal + params.Ksyn - params.Kon * vars.int.P.val * vars.int.R.val - params.DilRate * vars.int.R.val) // [nM/s]
        },
        F: {
            val: (() => 0),
            eq: (vars, params) => 
                (params.KF * vars.int.R.val / (params.Kr + vars.int.R.val ) - params.DilRate * vars.int.F.val)   // [nM/s]
        },
    },

    ext: {
        P: {
            val: (() => 0),
            eq: (vars, params) => 
                (params.Kout)  * (vars.int.producer.val === 1) - (params.Kin * vars.ext.P.val)  //secretion rate and uptake rate
        }
    }
};
 
window.params = {
    basal:   0.001,   // nM/s  (low but not zero, typical for weak leakiness in regulated genes)
    Kin:     0.8,    // 1/s   (efficient but within reported uptake rates for peptides in Bacillus)
    Kout:    0.007,   // nM/s  (modest secretion rate, compatible with quorum peptides)
    Ksyn:    0.001,    // nM/s  (robust but plausible peptide synthesis rate for strong signal transduction)
    Kon:     0.005,   // nM-1s-1 (association rate for moderately fast protein/peptide binding)
    DilRate: 0.00026, // 1/s   (in line with a 45min doubling time)
    KF:    0.03,    // nM/s  (as in your previous parameter set, typical for bacterial reporter systems)
    Kr:      30       // nM    (middle of plausible range for nM-scale dose threshold)
};


