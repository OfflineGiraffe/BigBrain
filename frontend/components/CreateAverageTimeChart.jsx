import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function CreateAverageTimeChart({ results }) {
  const chartRef = useRef(null);
  let chartInstance = null;
  
  // Function to calculate average answer time from results
  function getAverageAnswerTimes(results) {
    if (!results || results.length === 0) return [];
  
    const numQuestions = results[0].answers.length;
    const totalTimes = Array(numQuestions).fill(0);
    const userCounts = Array(numQuestions).fill(0);
  
    results.forEach(user => {
      user.answers.forEach((ans, index) => {
        if (ans.answeredAt && ans.questionStartedAt) {
          const answerTime = (new Date(ans.answeredAt) - new Date(ans.questionStartedAt)) / 1000; // in seconds
          totalTimes[index] += answerTime;
          userCounts[index]++;
        }
      });
    });
  
    return totalTimes.map((totalTime, i) => ({
      questionIndex: i + 1,
      averageTime: userCounts[i] > 0 ? totalTime / userCounts[i] : 0
    }));
  }

  useEffect(() => {
    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  useEffect(() => {
    renderChart();
  }, [results]);

  // Render chart function
  const renderChart = () => {
    if (!results || !results.length) return;
    
    const averageTimes = getAverageAnswerTimes(results);
    
    // Cleanup existing chart if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Make sure we have a canvas element to draw on
    if (!chartRef.current) return;

    // Create new chart
    chartInstance = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: averageTimes.map(p => `Q${p.questionIndex}`),
        datasets: [{
          label: 'Average Time (seconds)',
          data: averageTimes.map(p => p.averageTime.toFixed(2)),
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Average Answer Time by Question'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Time (seconds)'
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
    <div className="flex flex-col justify-center items-center bg-white rounded-md p-4 w-full">
      <canvas ref={chartRef} className="w-full max-w-full h-64"></canvas>
    </div>
  );
}

export default CreateAverageTimeChart;