export function makeChart(data,uPlot) {

    let makeFmt = suffix => (u, v, sidx) => {
        
            let d = u.data[sidx];
            v = d[d.length - 1];
        
        return v == null ? null : v.toFixed(1) + suffix;
    };

    const opts = {
        width: 1100,
        height: 500,
        series: [
            {
                value: (u, v, sidx, didx) => {
                    if (didx == null) {
                        let d = u.data[sidx];
                        v = d[d.length - 1];
                    }

                    return v;
                }
            },
            {
                label: "CPU",
                scale: "%",
                value: makeFmt('%'),
                stroke: "red",
            },
            {
                label: "RAM",
                scale: "%",
                value: makeFmt('%'),
                stroke: "blue",
            },
            {
                label: "TCP Out",
                scale: "mb",
                value: makeFmt('MB'),
                stroke: "green",
            }
        ],
        axes: [
            {},
            {
                scale: '%',
                values: (u, vals, space) => vals.map(v => +v.toFixed(1) + "%"),
            },
            {
                side: 1,
                scale: 'mb',
                values: (u, vals, space) => vals.map(v => +v.toFixed(2) + " MB"),
                grid: {show: false},
            },
        ]
    };

    let start1 = 0;
    const len1 = 3000;

    let data1 = sliceData(start1, start1 + len1,data);
    let uplot1 = new uPlot(opts, data1, document.body);

    setInterval(function() {
        start1 += 10;
        data1 = sliceData(start1, start1 + len1,data);
        uplot1.setData(data1);
    }, 100);

}




function sliceData(start, end, data) {
    let d = [];

    for (let i = 0; i < data.length; i++)
        d.push(data[i].slice(start, end));

    return d;
}