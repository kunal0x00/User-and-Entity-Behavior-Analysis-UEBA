
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityHeatmapData {
  hour: string;
  day: string;
  value: number;
}

interface ActivityHeatmapProps {
  data: ActivityHeatmapData[] | number[][];
  xLabels: string[];
  yLabels: string[];
  title: string;
  description?: string;
  className?: string;
}

const ActivityHeatmap = ({ 
  data, 
  xLabels, 
  yLabels, 
  title, 
  description, 
  className 
}: ActivityHeatmapProps) => {
  // Function to get a color based on value
  const getColor = (value: number) => {
    // Color scale from low (blue-ish) to high (red)
    if (value === 0) return 'bg-secondary/30';
    if (value < 0.15) return 'bg-blue-900/40';
    if (value < 0.3) return 'bg-blue-800/40';
    if (value < 0.45) return 'bg-blue-600/40';
    if (value < 0.6) return 'bg-yellow-500/40';
    if (value < 0.75) return 'bg-orange-500/40';
    return 'bg-red-500/40';
  };

  // Process data into a 2D array format if it's an array of ActivityHeatmapData
  let processedData: number[][] = [];
  
  if (!Array.isArray(data[0])) {
    // Convert ActivityHeatmapData[] to number[][]
    const heatmapData = data as ActivityHeatmapData[];
    processedData = yLabels.map((day) => {
      return xLabels.map((hour) => {
        const entry = heatmapData.find(item => item.day === day && item.hour === hour);
        return entry ? entry.value / 20 : 0; // Normalize to 0-1 range
      });
    });
  } else {
    // Data is already in number[][] format
    processedData = data as number[][];
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <div className="flex">
            <div className="w-12"></div> {/* Empty space for y-axis labels */}
            <div className="flex-1 flex">
              {xLabels.map((label, index) => (
                <div 
                  key={`x-label-${index}`} 
                  className="flex-1 text-center text-xs text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          
          {processedData.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex items-center">
              <div className="w-12 text-xs text-muted-foreground text-right pr-2">
                {yLabels[rowIndex]}
              </div>
              <div className="flex-1 flex">
                {row.map((value, colIndex) => (
                  <div 
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={cn(
                      "flex-1 aspect-square m-0.5 rounded transition-colors cursor-pointer hover:opacity-80",
                      getColor(value)
                    )}
                    title={`${yLabels[rowIndex]} at ${xLabels[colIndex]}: ${Math.round(value * 100)}%`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
