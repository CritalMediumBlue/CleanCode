export function makeChart(data,uPlot) {
    console.time('chart');

    function sliceData(start, end, data) {
        let d = [];

        for (let i = 0; i < data.length; i++)
            d.push(data[i].slice(start, end));

        return d;
    }

    let interval = 100;

    let makeFmt = suffix => (u, v, sidx, didx) => {
        if (didx == null) {
            let d = u.data[sidx];
            v = d[d.length - 1];
        }

        return v == null ? null : v.toFixed(1) + suffix;
    };

    const opts = {
        title: "Fixed length / sliding data slices",
        width: 1600,
        height: 600,
        cursor: {
            drag: {
                setScale: false,
            }
        },
        select: {
            show: false,
        },
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
    let len1 = 3000;

    let data1 = sliceData(start1, start1 + len1,data);
    let uplot1 = new uPlot(opts, data1, document.body);

    setInterval(function() {
        start1 += 10;
        let data1 = sliceData(start1, start1 + len1,data);
        uplot1.setData(data1);
    }, interval);

}