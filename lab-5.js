let tableData = require('./table-data');
const readline = require('readline'),
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  }),
  expectFormula = (a, b) => {
    const c = a + b;

    return - a / c * Math.log2(a / c) - b / c * Math.log2(b / c) || 0;
  },
  entropyFormula = (elements, num) => elements
    .map(el => el.amount / num * el.expect)
    .reduce((prev, cur) => prev + cur, 0),
  gainFormula = (entropy, expected) => expected - entropy,
  nextProp = (data) => {
    const keys = Object.keys(data[0]).filter(key => key !== 'result'),
      expected = expectFormula(
        data.filter(data => data.result).length,
        data.filter(data => !data.result).length
      ),
      props = keys.map(key => {
        const values = [];
        
        data.forEach(element => {
          const value = element[key];
          if (values.indexOf(value) === -1) {
            values.push(value);
          }
        });

        const expects = values.map(value => ({
            name: value,
            amount: data.filter(el => el[key] === value).length,
            expect: expectFormula(
              data.filter(el => el.result && el[key] === value).length,
              data.filter(el => !el.result && el[key] === value).length
            )
          })),
          entropy = entropyFormula(expects, data.length),
          gain = gainFormula(entropy, expected);

        return {
          gain,
          expects,
          entropy,
          expected,
          name: key
        };
      })

    return props.find(maxGainProp => props.every(prop => maxGainProp.gain >= prop.gain));
  },
  clearData = ((data, property, value) => {
    return data
      .filter(el => el[property] === value)
      .map(el => {
        delete el[property];

        return el;
      })
  }),
  calculateTree = function (property) {
    rl.question(`Please, provide ${property.name} value: `, (answer) => {
      if (answer == 'exit') {
        return rl.close(); //closing RL and returning from function.
      }

      tableData = clearData(tableData, property.name, answer);

      if (tableData.every(el => el.result) || tableData.every(el => !el.result)) {
        console.log(`If initial table data is right and result exists then it equals to ${tableData[0].result}!`);
        return rl.close();
      }

      calculateTree(nextProp(tableData)); //Calling this function again to ask new question
    });
  };

calculateTree(nextProp(tableData));
