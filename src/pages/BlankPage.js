import React from 'react';

const BlankPage = () => {
  return (
    <main id="main" className="main">
      <div className="pagetitle">
        <h1>Blank Page</h1>
        <nav>
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item active">Blank</li>
          </ol>
        </nav>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Blank Page</h5>
            <p>This page will be implemented later.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlankPage;
