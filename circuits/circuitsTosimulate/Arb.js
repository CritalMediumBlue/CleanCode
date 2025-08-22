
window.vars = {
    int: {
        P: {
            val: (() =>  0.1),
            eq: (vars, params) => params.Kin * vars.ext.P.val / (params.Kp + vars.ext.P.val) 
                - params.Kon * vars.int.P.val * vars.int.R.val 
                - params.DilRate * vars.int.P.val
        },

        R: {
            val: (() =>  0.1),
            eq: (vars, params) => params.Ksyn * vars.int.R.val / (params.Kr + vars.int.R.val)
                - params.Kon * vars.int.P.val * vars.int.R.val 
                - params.DilRate * vars.int.R.val
        }
    },

    ext: {
        P: {
            val: (() => 0.26),
            eq: (vars, params) => vars.int.R.val * params.Source - vars.ext.P.val * params.Sink
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
    Source: 1.8,
    Sink: 1.8
};
