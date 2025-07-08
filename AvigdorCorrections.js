
window.vars = {
    int: {
        AimP: {
            val: 1,
            eq: (vars, params) => params.Kin * vars.ext.AimP.val  - params.Kon * vars.int.AimP.val * vars.int.AimR.val - params.DilRate * vars.int.AimP.val
        },
        AimR: {
            val: 3,
            eq: (vars, params) => params.Ksyn * params.IPTG / (params.Kiptg + params.IPTG) *vars.int.AimR.val / (params.Kr + vars.int.AimR.val)- params.Kon * vars.int.AimP.val * vars.int.AimR.val - params.DilRate * vars.int.AimR.val
        } 
    },

    ext: {
        AimP: {
            val: 0.26,
            eq: (vars, params) => params.Kout * params.Xylose / (params.Kx + params.Xylose) * vars.int.AimR.val / (params.Kr + vars.int.AimR.val) -  params.Kin * vars.ext.AimP.val 
        }
    }
};

window.params = {Kin: 0.4, 
    Kout: 0.3, 
    Xylose: 0.04, 
    Kx: 0.02, 
    IPTG: 0.03, 
    Kiptg: 0.01, 
    Ksyn: 0.06, 
    Kr: 0.35, 
    Kon: 0.039, 
    DilRate: 0.008,};
