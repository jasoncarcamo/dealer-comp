import React, { Component, createRef } from 'react';
import { Typography, Box, Paper, Button, Stack } from '@mui/material';
import {
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import "./CompetitionAndCharts.css";

class CompetitionAndCharts extends Component {
  constructor(props) {
    super(props);
    this.lineChartsRef = createRef();
  }

  filterSalesDataForCurrentMonth() {
    const { salesData } = this.props;
    if (!Array.isArray(salesData) || salesData.length === 0) return [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    return salesData.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
    });
  }

  getSalespersonTotals() {
    const { teams } = this.props;
    const filteredData = this.filterSalesDataForCurrentMonth();
    const totals = {};
    const allMembers = new Set();
    teams.forEach((team) => {
      if (team.members) team.members.forEach((m) => allMembers.add(m));
    });
    allMembers.forEach((member) => {
      totals[member] = 0;
    });
    filteredData.forEach((dayEntry) => {
      allMembers.forEach((member) => {
        totals[member] += dayEntry[member] || 0;
      });
    });
    return totals;
  }

  getTeamTotals(salespersonTotals) {
    const { teams } = this.props;
    const teamTotals = {};
    teams.forEach((team) => {
      let total = 0;
      if (team.members && team.members.length) {
        team.members.forEach((member) => {
          total += salespersonTotals[member] || 0;
        });
      }
      teamTotals[team.name] = total;
    });
    return teamTotals;
  }

  aggregateSalesBySalesperson(team) {
    const filteredData = this.filterSalesDataForCurrentMonth();
    const result = [];
    filteredData.forEach((dayEntry) => {
      const day = { date: dayEntry.date };
      if (team.members && team.members.length) {
        team.members.forEach((member) => {
          day[member] = dayEntry[member] || 0;
        });
      }
      result.push(day);
    });
    result.sort((a, b) => (a.date > b.date ? 1 : -1));
    return result;
  }

  generateColors(count) {
    const baseColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57', '#888888'];
    return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
  }

  CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && this.props.teams.length) {
      const teamName = label;
      const team = this.props.teams.find((t) => t.name === teamName);
      const totalSales = payload[0].value;
      return (
        <Paper elevation={3} sx={{ padding: 1, backgroundColor: 'white', border: '1px solid #ccc', maxWidth: 250 }}>
          <Typography variant="subtitle1" fontWeight="bold">Team: {teamName}</Typography>
          <Typography variant="body2">Total Sales: {totalSales}</Typography>
          <Typography variant="body2" mt={1} fontWeight="bold">Members:</Typography>
          {team?.members?.length ? (
            team.members.map((member) => <Typography key={member} variant="body2">{member}</Typography>)
          ) : (
            <Typography variant="body2" color="text.secondary">No members</Typography>
          )}
        </Paper>
      );
    }
    return null;
  };

  handlePrint = () => {
    const printContents = this.lineChartsRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=800,width=1000');
    printWindow.document.write('<html><head><title>Print Charts</title></head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  handleDownload = async () => {
  const chartsEl = this.lineChartsRef.current;

  // 1️⃣ Reduce all vertical spacing temporarily
  const allContainers = chartsEl.querySelectorAll('*'); // capture all descendants
  const originalStyles = [];

  allContainers.forEach((el, i) => {
    const style = window.getComputedStyle(el);
    originalStyles[i] = {
      marginTop: style.marginTop,
      marginBottom: style.marginBottom,
      paddingTop: style.paddingTop,
      paddingBottom: style.paddingBottom,
    };
    el.style.marginTop = '0px';
    el.style.marginBottom = '2px'; // minimal gap
    el.style.paddingTop = '0px';
    el.style.paddingBottom = '0px';
  });

  // 2️⃣ Capture charts
  const canvas = await html2canvas(chartsEl, {
    scale: 1,
    backgroundColor: '#ffffff',
    useCORS: true,
  });

  // 3️⃣ Restore original spacing
  allContainers.forEach((el, i) => {
    el.style.marginTop = originalStyles[i].marginTop;
    el.style.marginBottom = originalStyles[i].marginBottom;
    el.style.paddingTop = originalStyles[i].paddingTop;
    el.style.paddingBottom = originalStyles[i].paddingBottom;
  });

  // 4️⃣ Prepare PDF
  const imgData = canvas.toDataURL('image/jpeg', 0.7);
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // 5️⃣ First page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // 6️⃣ Additional pages if needed
  const pageCanvas = document.createElement('canvas');
  const pageCtx = pageCanvas.getContext('2d');

  while (heightLeft > 0) {
    position += pdfHeight;

    pageCanvas.width = canvas.width;
    pageCanvas.height = (pdfHeight * canvas.width) / pdfWidth;

    pageCtx.fillStyle = 'white';
    pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    pageCtx.drawImage(
      canvas,
      0,
      (position * canvas.width) / pdfWidth,
      canvas.width,
      pageCanvas.height,
      0,
      0,
      canvas.width,
      pageCanvas.height
    );

    const pageData = pageCanvas.toDataURL('image/jpeg', 0.7);
    pdf.addPage();
    pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, pdfHeight);

    heightLeft -= pdfHeight;
  }

  // 7️⃣ Save PDF
  pdf.save('line_charts.pdf');
};


  render() {
    const { teams } = this.props;
    const salespersonTotals = this.getSalespersonTotals();
    const teamTotals = this.getTeamTotals(salespersonTotals);

    const now = new Date();
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const currentMonthYear = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    if (!teams.length) {
      return <Typography>No teams available. Please add teams first.</Typography>;
    }
    if (teams.length === 0 || Object.keys(teamTotals).length === 0) {
      return <Typography>No sales data available for {currentMonthYear}.</Typography>;
    }

    const barData = teams.map((team) => ({
      team: team.name,
      totalSales: teamTotals[team.name] || 0,
      color: team.color || '#8884d8',
    }));

    return (
      <Box sx={{ maxWidth: 900, margin: '0 auto', padding: 2 }}>
        <Typography variant="h5" gutterBottom>Team Sales ({currentMonthYear})</Typography>

        <Box sx={{ mb: 4 }}>
          {teams.map((team) => (
            <Paper key={team.name} sx={{ mb: 2, p: 2, borderLeft: `6px solid ${team.color}`, boxShadow: 1 }}>
              <Typography variant="h6" sx={{ color: team.color }}>
                {team.name} — Total Sales: {teamTotals[team.name] || 0}
              </Typography>
              <Box sx={{ pl: 2, mt: 1 }}>
                {team.members?.length ? (
                  team.members.map((member) => (
                    <Typography key={member} variant="body2" sx={{ color: '#555' }}>
                      {member}: {salespersonTotals[member] || 0}
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No members</Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Bar chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="team" tick={{ textAnchor: 'middle' }} />
            <YAxis allowDecimals={false} />
            <Tooltip content={<this.CustomTooltip />} />
            <Legend />
            <Bar dataKey="totalSales" name="Total Sales">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Controls */}
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="contained" onClick={this.handlePrint}>Print Line Charts</Button>
          <Button variant="outlined" onClick={this.handleDownload}>Download as PDF</Button>
        </Stack>

        {/* Line charts section */}
        <Box sx={{ mt: 1 }} ref={this.lineChartsRef}>
          <Typography variant="h5" gutterBottom>
            Salesperson Daily Sales by Team ({currentMonthYear})
          </Typography>
          {teams.map((team) => {
            if (!team.members || team.members.length === 0) {
              return (
                <Typography key={team.name} color="text.secondary" sx={{ mb: 3 }}>
                  No members in team "{team.name}" to display sales.
                </Typography>
              );
            }
            const salesDataPerSalesperson = this.aggregateSalesBySalesperson(team);
            const colors = this.generateColors(team.members.length);
            return (
              <Paper
                key={team.name}
                sx={{ mb: 5, p: 2, borderLeft: `6px solid ${team.color}`, boxShadow: 1 }}
                aria-label={`Salesperson daily sales for team ${team.name}`}
              >
                <Typography variant="h6" sx={{ color: team.color, mb: 2 }}>
                  {team.name} - Salesperson Daily Sales
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={salesDataPerSalesperson} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {team.members.map((member, idx) => (
                      <Line
                        key={member}
                        type="monotone"
                        dataKey={member}
                        stroke={colors[idx]}
                        dot={false}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  }
}

export default CompetitionAndCharts;