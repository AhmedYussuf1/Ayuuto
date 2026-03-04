  import 'bootstrap/dist/css/bootstrap.min.css';
import Card from './Card';

export default function DashBoardCards(title, members, monthlyContribution,
    memberToBePaidNext, cardIcon, progressBarWidth , contribution){
    return(
 
 <div className="card shadow-sm" style={{maxWidth: "400px", borderRadius: "12px"}}>
  <div className="card-body">
    <div className="d-flex justify-content-between align-items-center mb-1">
      <h5 className="card-title mb-0 fw-bold" style={{color: "#2c3e50"}}>{title}</h5>
      <i className="bi bi-chevron-right text-muted"></i> </div>
    <p className="text-muted small mb-4">{members} members</p>

    <div className="d-flex justify-content-between mb-2">
      <span className="text-secondary small">Monthly contribution</span>
      <span className="fw-bold text-success">$ {contribution}</span>
    </div>

    <div className="d-flex justify-content-between mb-3">
      <span className="text-secondary small">Next payout</span>
      <span className="fw-bold" style={{color: "#2c3e50"}}>{{memberToBePaidNext}}</span>
    </div>

    <div className="progress" style={{height: "6px"}}>
      <div className="progress-bar bg-success" role="progressbar" style={{width: progressBarWidth}} aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
  </div>
</div>

 
 
   
      
    );

}