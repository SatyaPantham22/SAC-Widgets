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

class CustomPieSample extends HTMLElement {
  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this._shadowRoot.innerHTML = cssTemplate + htmlTemplate;
    this._root = this._shadowRoot.getElementById("root");
    this._props = {};
    this._myDataSource = null;
    this.width = 600;
    this.height = 420;
    this.dimensionFeed = [];
    this.measureFeed = [];
    this.caption = "";
  }

  static get observedAttributes() {
    return ['width', 'height', 'dimensionFeed', 'measureFeed', 'caption'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  onCustomWidgetResize(width, height) {
    this.width = width;
    this.height = height;
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
        text: this.caption,
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

  getCaption() {
    return this.caption;
  }

  setCaption(caption) {
    this.caption = caption;
    this.render();
  }

  openSelectModelDialog() {
    this.dataBindings.getDataBinding('myDataSource').openSelectModelDialog();
  }

  getDimensions() {
    return this.dataBindings.getDataBinding('myDataSource').getDataSource().getDimensions();
  }

  getMeasures() {
    return this.dataBindings.getDataBinding('myDataSource').getDataSource().getMeasures();
  }

  addDimension(dimensionId) {
    // Add logic to handle adding a dimension
  }

  addMeasure(measureId) {
    // Add logic to handle adding a measure
  }

  removeDimension(dimensionId) {
    // Add logic to handle removing a dimension
  }

  removeMeasure(measureId) {
    // Add logic to handle removing a measure
  }

  getDimensionsOnFeed() {
    // Return the dimensions currently on the feed
    return this.dimensionFeed;
  }

  getMeasuresOnFeed() {
    // Return the measures currently on the feed
    return this.measureFeed;
  }

  getDataSource() {
    return this.dataBindings.getDataBinding('myDataSource').getDataSource();
  }

  setModel(modelId) {
    this.dataBindings.getDataBinding('myDataSource').setModel(modelId);
  }
}

customElements.define("com-sap-sample-echarts-custom_pie_chart", CustomPieSample);
