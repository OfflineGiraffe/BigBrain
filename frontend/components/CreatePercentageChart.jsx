import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function CreatePercentageChart({ results }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  
  // Function to calculate correct percentages from results
  function getCorrectPercentages(results) {
    if (!results || results.length === 0) return [];
  
    const numQuestions = results[0].answers.length;
    const correctCounts = Array(numQuestions).fill(0);
  
    results.forEach(user => {
      user.answers.forEach((ans, index) => {
        if (ans.correct) correctCounts[index]++;
      });
    });
  
    return correctCounts.map((count, i) => ({
      questionIndex: i + 1,
      correctPercentage: (count / results.length) * 100
    }));
  }

  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);
  

  useEffect(() => {
    renderChart();
  }, [results]);

  // Render chart function
  const renderChart = () => {
    if (!results || !results.length || !chartRef.current) return;
  
    const percentages = getCorrectPercentages(results);
  
    // Destroy existing chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
  
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: percentages.map(p => `Q${p.questionIndex}`),
        datasets: [{
          label: 'Correct Answers (%)',
          data: percentages.map(p => p.correctPercentage.toFixed(2)),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
          title: {
            display: true,
            text: 'Correct Answer Percentage by Question'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Percentage (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Question'
            }
          }
        }
      }
    });
  };
  

  return (
    <div className="flex flex-col justify-center items-center bg-white rounded-md">
      <canvas ref={chartRef} className="w-full max-w-full h-64"></canvas>
    </div>
  );
}

export default CreatePercentageChart;