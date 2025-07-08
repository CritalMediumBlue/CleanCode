
window.vars = {
    int: {
        AimP: {
            val: (() => 0.5),
            eq: (vars, params) =>  (params.Kin * vars.ext.AimP.val  - params.Kon * vars.int.AimP.val * vars.int.AimR.val - params.DilRate * vars.int.AimP.val)
        },
        AimR: {

            val: (() => Math.random() > 0.5 ? 0 : 5),
            eq: (vars, params) => 
                (params.Ksyn * params.Xylose / (params.Kx + params.Xylose) - params.Kon * vars.int.AimP.val * vars.int.AimR.val - params.DilRate * vars.int.AimR.val) * (vars.int.AimR.val !== 0)
            ,
        }
    },

    ext: {
        AimP: {
            val: (() => 0.25),
            eq: (vars, params) => 
                (params.Kout * params.IPTG / (params.Kiptg + params.IPTG))  * (vars.int.AimR.val === 0) - (params.Kin * vars.ext.AimP.val)
        }
    }
};

window.params = {
    Kin: 0.2, 
    Kout: 0.15, 
    Xylose: 0.015, 
    Kx: 0.02, 
    IPTG: 0.01, 
    Kiptg: 0.01, 
    Ksyn: 0.05, 
    Kon: 0.04, 
    DilRate: 0.006
};
