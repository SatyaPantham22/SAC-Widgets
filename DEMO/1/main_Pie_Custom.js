// /path/to/custom_pie_chart.js

const getScriptPromisify = (src) => {
  const __define = define;
  define = undefined;
  return new Promise((resolve, reject) => {
    $.getScript(src, () => {
      define = __define;
      resolve();
    }).fail((jqxhr, settings, exception) => {
      define = __define;
      reject(new Error(`Failed to load script: ${src}`));
    });
  });
};

// CSS Template
const cssTemplate = `
<style>
  #root {
    width: 100%;
    height: 100%;
  }
</style>
`;

// HTML Template
const htmlTemplate = `
  <div id="root"></div>
`;

// Custom Element Definition
class CustomPieSample extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.innerHTML = cssTemplate + htmlTemplate;
    this._root = this._shadowRoot.getElementById("root");
    this._props = {};
    this._myDataSource = null;
  }

  connectedCallback() {
    this.render();
  }

  onCustomWidgetResize(width, height) {
    this.render();
  }

  set myDataSource(dataBinding) {
    this._myDataSource = dataBinding;
    this.render();
  }

  async render() {
    try {
      await getScriptPromisify("https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js");
      this._renderChart();
    } catch (error) {
      console.error(error);
    }
  }

  _renderChart() {
    if (!this._myDataSource || this._myDataSource.state !== "success") {
      return;
    }

    const dimension = this._myDataSource.metadata.feeds.dimensions.values[0];
    const measure = this._myDataSource.metadata.feeds.measures.values[0];
    const data = this._myDataSource.data
      .map(item => ({ name: item[dimension].label, value: item[measure].raw }))
      .sort((a, b) => b.value - a.value);

    const myChart = echarts.init(this._root);
    const option = {
      backgroundColor: '',
      title: {
        text: '',
        left: 'center',
        top: 20,
        textStyle: { color: '' },
      },
      tooltip: { trigger: 'item' },
      visualMap: {
        show: false,
        min: 0,
        max: data[0].value * 1.5,
        inRange: { colorLightness: [0, 1] },
      },
      series: [
        {
          name: '',
          type: 'pie',
          radius: '55%',
          center: ['50%', '50%'],
          data,
          roseType: 'radius',
          label: { color: '#1D2D3E' },
          labelLine: {
            lineStyle: { color: '#1D2D3E' },
            smooth: 0.2,
            length: 10,
            length2: 20,
          },
          itemStyle: {
            color: '#0070F2',
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: idx => Math.random() * 200,
        },
      ],
    };
    myChart.setOption(option);
  }
}

customElements.define("com-sap-sample-echarts-custom_pie_chart", CustomPieSample);
