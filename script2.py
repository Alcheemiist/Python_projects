import psycopg2
import pandas as pd
import sys

def handle_table(cursor_obj, writer, studentId, script_name, Sheet_name):
    with open(script_name, 'r') as file:
        sql_script = file.read()
    sql_script = sql_script.format(studentId=studentId)
    cursor_obj.execute(sql_script)
    result = cursor_obj.fetchall()
    columns = [column[0] for column in cursor_obj.description]
    result_df = pd.DataFrame(result, columns=columns)
    result_df.to_excel(writer, sheet_name=Sheet_name, index=True)
    print("Done -> " + script_name)
    # print(result_df)

def handle_data(cursor_obj, writer, studentId, script_name, FILENAME ):
    with open(script_name, 'r') as file:
        sql_script = file.read()
    sql_script = sql_script.format(studentId=studentId)
    cursor_obj.execute(sql_script)
    result = cursor_obj.fetchall()

    # df = pd.read_excel(FILENAME, 'Data_Sheet1')


    columns = [column[0] for column in cursor_obj.description]
    result_df = pd.DataFrame(result, columns=columns).T
    result_df['Table'] = 'table_name'
    result_df = result_df.rename(columns={0: 'Attributes'})
    # result_df = df.append(result_df, ignore_index=True)
    result_df.to_excel(writer, sheet_name='Data_Sheet1', index=True)
    print("Done -> " + script_name)
    # print(result_df)


def main(argv):
    if len(argv) != 1:
        print("Usage: python script2.py <studentId>")
        quit()
    studentId = argv[0]
    FILENAME = "record_VQ110_"+ studentId+ ".xlsx"
    writer = pd.ExcelWriter(FILENAME, engine='xlsxwriter')
    con = psycopg2.connect( database="postgres", user="postgres", password="mysecretpassword", host="localhost", port= '5432')

    if (con):
        print(".....Connection Successful.......")
    else:
        print("!!.....Connection Unsuccessful......!!")

    try :
        cursor_obj = con.cursor()
    except psycopg2.Error as e:
        print("Error while connecting to PostgreSQL", e)

    ## still need to add the table name , attributs and the values to be inserted
    # handle_data(cursor_obj, writer, studentId, './scripts/data.sql', FILENAME)
    handle_table(cursor_obj, writer, studentId, './scripts/sfrstcr.sql', 'sfrstcr')
    handle_table(cursor_obj, writer, studentId, './scripts/gobintl.sql', 'gobintl')
    handle_table(cursor_obj, writer, studentId, './scripts/sgbstdn.sql', 'sgbstdn')
    handle_table(cursor_obj, writer, studentId, './scripts/spraddr.sql', 'spraddr')
    handle_table(cursor_obj, writer, studentId, './scripts/spbpers.sql', 'spbpers')
    handle_table(cursor_obj, writer, studentId, './scripts/sorhsch.sql', 'sorhsch')

    
    handle_table(cursor_obj, writer, studentId, './scripts/stvsbgi.sql', 'stvsbgi')
    handle_table(cursor_obj, writer, studentId, './scripts/stvdplm.sql', 'stvdplm')
    handle_table(cursor_obj, writer, studentId, './scripts/ssrmeet.sql', 'ssrmeet')
    handle_table(cursor_obj, writer, studentId, './scripts/ssbsect.sql', 'ssbsect')
    handle_table(cursor_obj, writer, studentId, './scripts/sortest.sql', 'sortest')
    handle_table(cursor_obj, writer, studentId, './scripts/shrtgpa.sql', 'shrtgpa')
    handle_table(cursor_obj, writer, studentId, './scripts/shrtckn.sql', 'shrtckn')
    handle_table(cursor_obj, writer, studentId, './scripts/shrtckg.sql', 'shrtckg')
    handle_table(cursor_obj, writer, studentId, './scripts/shrlgpa.sql', 'shrlgpa')
    handle_table(cursor_obj, writer, studentId, './scripts/ku_student_absence.sql', 'ku_student_absence')
    handle_table(cursor_obj, writer, studentId, './scripts/ku_attendance_sheets.sql', 'ku_attendance_sheets')
    handle_table(cursor_obj, writer, studentId, './scripts/blackboardgrade.sql', 'blackboardgrade')

    writer._save()
    cursor_obj.close()
    con.close()
    print("...... End Connection .......")

if __name__ == "__main__":
    main(sys.argv[1:])