import { Button } from "react-bootstrap"

export default function SubmitButton({isLoading, elapsedTime, lastRunTime})
{
    return (
        <>
            <Button 
                variant="success" 
                size="lg" 
                type="submit" 
                disabled={isLoading}
                className="large-control-button"
            >
                {isLoading ? `Optimizing... (${elapsedTime}s)` : "Run Optimization"}
            </Button>
            
            <div className="timer-display" style={{ marginTop: '0.5vh'}}>
                {!isLoading && lastRunTime !== null && (
                    <span className='lastRun'>Last run took: {lastRunTime}s</span>
                )}
            </div>
        </>
    )
}