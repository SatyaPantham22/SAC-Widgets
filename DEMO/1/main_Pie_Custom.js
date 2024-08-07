var getScriptPromisify = (src) => {
  // Workaround with conflict between geo widget and echarts.
  const __define = define;
  define = undefined;
  return new Promise((resolve, reject) => {
    $.getScript(src, () => {
      define = __define;
      resolve();
    }).fail(reject);
  });
};

(function () {
  const prepared = document.createElement("template");
  prepared.innerHTML = `
        <style>
        </style>
        <div id="root" style="width: 100%; height: 100%;">
        </div>
      `;
  class CustomPieSample extends HTMLElement {
    constructor() {
      super();

      this._shadowRoot = this.attachShadow({ mode: "open" });
      this._shadowRoot.appendChild(prepared.content.cloneNode(true));

      this._root = this._shadowRoot.getElementById("root");

      this._props = {};

      this.render();
    }

    onCustomWidgetResize(width, height) {
      if (this._myChart) {
        this._myChart.resize();
      }
    }

    set myDataSource(dataBinding) {
      this._myDataSource = dataBinding;
      this.render();
    }

    async render() {
      try {
        await getScriptPromisify(
          "https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"
        );
      } catch (error) {
        console.error('Error loading ECharts script:', error);
        return;
      }

      if (!this._myDataSource || this._myDataSource.state !== "success") {
        return;
      }

      const dimensions = this._myDataSource.metadata.feeds.dimensions.values;
      const measures = this._myDataSource.metadata.feeds.measures.values;

      if (!dimensions.length || !measures.length) {
        console.error('Invalid data source structure');
        return;
      }

      const dimension = dimensions[0];
      const measure = measures[0];
      const data = this._myDataSource.data.map((data) => {
        return {
          name: data[dimension].label,
          value: data[measure].raw
        }
      }).sort((a, b) => a.value - b.value);

      if (!this._myChart) {
        this._myChart = echarts.init(this._root, "white");
      }

      const option = {
        backgroundColor: '',
        title: {
          text: '',
          left: 'center',
          top: 20,
          textStyle: {
            color: ''
          }
        },
        tooltip: {
          trigger: 'item'
        },
        visualMap: {
          show: false,
          min: 0,
          max: data[data.length - 1].value * 1.5,
          inRange: {
            colorLightness: [0, 1]
          }
        },
        series: [
          {
            name: '',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data,
            roseType: 'radius',
            label: {
              color: '#1D2D3E'
            },
            labelLine: {
              lineStyle: {
                color: '#1D2D3E'
              },
              smooth: 0.2,
              length: 10,
              length2: 20
            },
            itemStyle: {
              color: '#0070F2',
              shadowBlur: 15,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: function (idx) {
              return Math.random() * 200;
            }
          }
        ]
      };
      this._myChart.setOption(option);
    }
  }

  customElements.define("com-sap-sample-echarts-custom_pie_chart", CustomPieSample);
})();
