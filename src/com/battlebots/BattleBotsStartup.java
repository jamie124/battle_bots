package com.battlebots;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Calendar;

/**
 * Created with IntelliJ IDEA.
 * User: James Whitwell
 * Date: 2/8/13
 * Time: 9:16 PM
 * To change this template use File | Settings | File Templates.
 */
public class BattleBotsStartup extends HttpServlet {
	public void init() throws ServletException {

		System.out.println("");

		SimpleDateFormat dFmt = new SimpleDateFormat("dd-MMM-yy HH:mm:ss");

		System.out.println(dFmt.format(new java.util.Date()) + " - Battle Bots " + Constants.APP_VERSION);
		System.out.println("(c) 2002-" + Calendar.getInstance().get(Calendar.YEAR)
		);
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

	}
}
